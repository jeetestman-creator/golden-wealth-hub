
-- Update deposit status change trigger to also send email
CREATE OR REPLACE FUNCTION public.notify_deposit_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email text;
  email_subject text;
  email_body text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('confirmed', 'rejected') THEN
    -- In-app notification
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

    -- Get user email for email notification
    SELECT email INTO user_email FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;

    IF user_email IS NOT NULL THEN
      email_subject := CASE WHEN NEW.status = 'confirmed' 
        THEN 'Gold X USDT - Deposit Confirmed ✅'
        ELSE 'Gold X USDT - Deposit Update' END;
      email_body := CASE WHEN NEW.status = 'confirmed'
        THEN '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:40px;border-radius:12px;border:1px solid #333"><div style="text-align:center;margin-bottom:30px"><div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#d4a017,#b8860b);line-height:48px;font-weight:bold;color:#0a0a0a;font-size:18px">GX</div><h1 style="color:#d4a017;margin:10px 0 0">Deposit Confirmed</h1></div><p>Your deposit of <strong style="color:#d4a017">$' || NEW.amount || ' USDT</strong> on <strong>' || NEW.network || '</strong> has been confirmed.</p><p>Net amount credited: <strong style="color:#d4a017">$' || NEW.net_amount || ' USDT</strong></p><p style="color:#888;font-size:12px;margin-top:30px;border-top:1px solid #333;padding-top:15px">Gold X USDT - Secure Gold-Backed USDT Investment</p></div>'
        ELSE '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:40px;border-radius:12px;border:1px solid #333"><div style="text-align:center;margin-bottom:30px"><div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#d4a017,#b8860b);line-height:48px;font-weight:bold;color:#0a0a0a;font-size:18px">GX</div><h1 style="color:#e74c3c;margin:10px 0 0">Deposit Rejected</h1></div><p>Your deposit of <strong>$' || NEW.amount || ' USDT</strong> has been rejected.</p><p>Please contact support for more information.</p><p style="color:#888;font-size:12px;margin-top:30px;border-top:1px solid #333;padding-top:15px">Gold X USDT - Secure Gold-Backed USDT Investment</p></div>'
      END;

      PERFORM net.http_post(
        url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-notification-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)
        ),
        body := jsonb_build_object('to', user_email, 'subject', email_subject, 'html', email_body)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Update withdrawal status change trigger to also send email
CREATE OR REPLACE FUNCTION public.notify_withdrawal_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email text;
  email_subject text;
  email_body text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    -- In-app notification
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

    -- Get user email
    SELECT email INTO user_email FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;

    IF user_email IS NOT NULL THEN
      email_subject := CASE WHEN NEW.status = 'approved'
        THEN 'Gold X USDT - Withdrawal Approved ✅'
        ELSE 'Gold X USDT - Withdrawal Update' END;
      email_body := CASE WHEN NEW.status = 'approved'
        THEN '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:40px;border-radius:12px;border:1px solid #333"><div style="text-align:center;margin-bottom:30px"><div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#d4a017,#b8860b);line-height:48px;font-weight:bold;color:#0a0a0a;font-size:18px">GX</div><h1 style="color:#d4a017;margin:10px 0 0">Withdrawal Approved</h1></div><p>Your withdrawal of <strong style="color:#d4a017">$' || NEW.amount || ' USDT</strong> to wallet <code style="background:#1a1a1a;padding:2px 6px;border-radius:4px">' || LEFT(NEW.wallet_address, 15) || '...</code> has been approved and is being processed.</p><p style="color:#888;font-size:12px;margin-top:30px;border-top:1px solid #333;padding-top:15px">Gold X USDT - Secure Gold-Backed USDT Investment</p></div>'
        ELSE '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:40px;border-radius:12px;border:1px solid #333"><div style="text-align:center;margin-bottom:30px"><div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#d4a017,#b8860b);line-height:48px;font-weight:bold;color:#0a0a0a;font-size:18px">GX</div><h1 style="color:#e74c3c;margin:10px 0 0">Withdrawal Rejected</h1></div><p>Your withdrawal of <strong>$' || NEW.amount || ' USDT</strong> has been rejected.</p><p>Please contact support for more information.</p><p style="color:#888;font-size:12px;margin-top:30px;border-top:1px solid #333;padding-top:15px">Gold X USDT - Secure Gold-Backed USDT Investment</p></div>'
      END;

      PERFORM net.http_post(
        url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-notification-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)
        ),
        body := jsonb_build_object('to', user_email, 'subject', email_subject, 'html', email_body)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
