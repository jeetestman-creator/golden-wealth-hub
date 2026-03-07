
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  deposit_confirmed boolean NOT NULL DEFAULT true,
  deposit_rejected boolean NOT NULL DEFAULT true,
  withdrawal_approved boolean NOT NULL DEFAULT true,
  withdrawal_rejected boolean NOT NULL DEFAULT true,
  roi_payout boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.user_wants_email(p_user_id uuid, p_event_type text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE p_event_type
    WHEN 'deposit_confirmed' THEN COALESCE((SELECT deposit_confirmed FROM notification_preferences WHERE user_id = p_user_id), true)
    WHEN 'deposit_rejected' THEN COALESCE((SELECT deposit_rejected FROM notification_preferences WHERE user_id = p_user_id), true)
    WHEN 'withdrawal_approved' THEN COALESCE((SELECT withdrawal_approved FROM notification_preferences WHERE user_id = p_user_id), true)
    WHEN 'withdrawal_rejected' THEN COALESCE((SELECT withdrawal_rejected FROM notification_preferences WHERE user_id = p_user_id), true)
    WHEN 'roi_payout' THEN COALESCE((SELECT roi_payout FROM notification_preferences WHERE user_id = p_user_id), true)
    ELSE true
  END;
$$;

CREATE OR REPLACE FUNCTION public.notify_deposit_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
  email_subject text;
  email_body text;
  event_type text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('confirmed', 'rejected') THEN
    event_type := 'deposit_' || NEW.status;
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.status = 'confirmed' THEN 'Deposit Confirmed' ELSE 'Deposit Rejected' END,
      CASE WHEN NEW.status = 'confirmed' 
        THEN 'Your deposit of $' || NEW.amount || ' USDT has been confirmed. Net amount of $' || NEW.net_amount || ' USDT has been credited.'
        ELSE 'Your deposit of $' || NEW.amount || ' USDT has been rejected. Please contact support.'
      END,
      CASE WHEN NEW.status = 'confirmed' THEN 'success' ELSE 'error' END
    );
    IF user_wants_email(NEW.user_id, event_type) THEN
      SELECT email INTO user_email FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
      IF user_email IS NOT NULL THEN
        email_subject := CASE WHEN NEW.status = 'confirmed' THEN 'Gold X USDT - Deposit Confirmed' ELSE 'Gold X USDT - Deposit Update' END;
        email_body := CASE WHEN NEW.status = 'confirmed'
          THEN '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:40px;border-radius:12px;border:1px solid #333"><div style="text-align:center;margin-bottom:30px"><div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#d4a017,#b8860b);line-height:48px;font-weight:bold;color:#0a0a0a;font-size:18px">GX</div><h1 style="color:#d4a017;margin:10px 0 0">Deposit Confirmed</h1></div><p>Your deposit of <strong style="color:#d4a017">$' || NEW.amount || ' USDT</strong> on <strong>' || NEW.network || '</strong> has been confirmed.</p><p>Net amount credited: <strong style="color:#d4a017">$' || NEW.net_amount || ' USDT</strong></p><p style="color:#888;font-size:12px;margin-top:30px;border-top:1px solid #333;padding-top:15px">Gold X USDT</p></div>'
          ELSE '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:40px;border-radius:12px;border:1px solid #333"><div style="text-align:center;margin-bottom:30px"><div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#d4a017,#b8860b);line-height:48px;font-weight:bold;color:#0a0a0a;font-size:18px">GX</div><h1 style="color:#e74c3c;margin:10px 0 0">Deposit Rejected</h1></div><p>Your deposit of <strong>$' || NEW.amount || ' USDT</strong> has been rejected.</p><p>Please contact support.</p><p style="color:#888;font-size:12px;margin-top:30px;border-top:1px solid #333;padding-top:15px">Gold X USDT</p></div>'
        END;
        PERFORM net.http_post(
          url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-notification-email',
          headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)),
          body := jsonb_build_object('to', user_email, 'subject', email_subject, 'html', email_body)
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_withdrawal_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
  email_subject text;
  email_body text;
  event_type text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    event_type := 'withdrawal_' || NEW.status;
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.status = 'approved' THEN 'Withdrawal Approved' ELSE 'Withdrawal Rejected' END,
      CASE WHEN NEW.status = 'approved'
        THEN 'Your withdrawal of $' || NEW.amount || ' USDT to ' || LEFT(NEW.wallet_address, 10) || '... has been approved.'
        ELSE 'Your withdrawal of $' || NEW.amount || ' USDT has been rejected. Please contact support.'
      END,
      CASE WHEN NEW.status = 'approved' THEN 'success' ELSE 'error' END
    );
    IF user_wants_email(NEW.user_id, event_type) THEN
      SELECT email INTO user_email FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
      IF user_email IS NOT NULL THEN
        email_subject := CASE WHEN NEW.status = 'approved' THEN 'Gold X USDT - Withdrawal Approved' ELSE 'Gold X USDT - Withdrawal Update' END;
        email_body := CASE WHEN NEW.status = 'approved'
          THEN '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:40px;border-radius:12px;border:1px solid #333"><div style="text-align:center;margin-bottom:30px"><div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#d4a017,#b8860b);line-height:48px;font-weight:bold;color:#0a0a0a;font-size:18px">GX</div><h1 style="color:#d4a017;margin:10px 0 0">Withdrawal Approved</h1></div><p>Your withdrawal of <strong style="color:#d4a017">$' || NEW.amount || ' USDT</strong> to <code style="background:#1a1a1a;padding:2px 6px;border-radius:4px">' || LEFT(NEW.wallet_address, 15) || '...</code> has been approved.</p><p style="color:#888;font-size:12px;margin-top:30px;border-top:1px solid #333;padding-top:15px">Gold X USDT</p></div>'
          ELSE '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:40px;border-radius:12px;border:1px solid #333"><div style="text-align:center;margin-bottom:30px"><div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#d4a017,#b8860b);line-height:48px;font-weight:bold;color:#0a0a0a;font-size:18px">GX</div><h1 style="color:#e74c3c;margin:10px 0 0">Withdrawal Rejected</h1></div><p>Your withdrawal of <strong>$' || NEW.amount || ' USDT</strong> has been rejected.</p><p>Please contact support.</p><p style="color:#888;font-size:12px;margin-top:30px;border-top:1px solid #333;padding-top:15px">Gold X USDT</p></div>'
        END;
        PERFORM net.http_post(
          url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-notification-email',
          headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)),
          body := jsonb_build_object('to', user_email, 'subject', email_subject, 'html', email_body)
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
