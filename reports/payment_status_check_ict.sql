select ci_pay_evt_char.adhoc_char_val as msgid,ci_pay.pay_event_id as Order_ID ,ci_pay.pay_amt as pay_amt,ci_pay.ilm_dt as Recharge_Date,
  decode(ci_pay.PAY_STATUS_FLG,10,'Incomplete',20,'Error',30,'Freezable',50,'Success',60,'Canceled') ORDER_STATUS 
  from cisadm.ci_pay_evt_char,cisadm.ci_pay 
   where ci_pay_evt_char.PAY_EVENT_ID= ci_pay.pay_event_id AND ci_pay_evt_char.CHAR_TYPE_CD = 'CM_PAYTR'
   and ci_pay_evt_char.adhoc_char_val in('8493D6012025050400004709','8493D6012025050400018247','8493D6012025050400004723','8493D6012025050400004717')
   order by ci_pay.ilm_dt asc;