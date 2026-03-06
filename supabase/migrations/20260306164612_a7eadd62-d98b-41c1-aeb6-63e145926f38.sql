
-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to auto-notify on deposit status change
CREATE OR REPLACE FUNCTION public.notify_deposit_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('confirmed', 'rejected') THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.status = 'confirmed' THEN 'Deposit Confirmed' ELSE 'Deposit Rejected' END,
      CASE WHEN NEW.status = 'confirmed' 
        THEN 'Your deposit of $' || NEW.amount || ' USDT has been confirmed. Net amount of $' || NEW.net_amount || ' USDT has been credited to your account.'
        ELSE 'Your deposit of $' || NEW.amount || ' USDT has been rejected. Please contact support for details.'
      END,
      CASE WHEN NEW.status = 'confirmed' THEN 'success' ELSE 'error' END
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_deposit_status_change
  AFTER UPDATE ON public.deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_deposit_status_change();

-- Create function to auto-notify on withdrawal status change
CREATE OR REPLACE FUNCTION public.notify_withdrawal_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.status = 'approved' THEN 'Withdrawal Approved' ELSE 'Withdrawal Rejected' END,
      CASE WHEN NEW.status = 'approved'
        THEN 'Your withdrawal of $' || NEW.amount || ' USDT to ' || LEFT(NEW.wallet_address, 10) || '... has been approved and is being processed.'
        ELSE 'Your withdrawal of $' || NEW.amount || ' USDT has been rejected. Please contact support.'
      END,
      CASE WHEN NEW.status = 'approved' THEN 'success' ELSE 'error' END
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_withdrawal_status_change
  AFTER UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_withdrawal_status_change();

-- Also notify on new deposit creation
CREATE OR REPLACE FUNCTION public.notify_new_deposit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.user_id,
    'Deposit Submitted',
    'Your deposit of $' || NEW.amount || ' USDT on ' || NEW.network || ' has been submitted and is awaiting confirmation.',
    'info'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_deposit
  AFTER INSERT ON public.deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_deposit();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
