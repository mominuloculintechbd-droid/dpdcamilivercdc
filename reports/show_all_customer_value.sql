select adhoc_char_val old_account_id ,sum(tot_amt) amount  from 
cisadm.ci_sa n,cisadm.ci_Sa_sp o,CISADM.ci_sp_Char p,cisadm.ci_acct q,cisadm.ci_ft s where  
n.sa_id=o.sa_id and o.sp_id=p.sp_id and n.sa_Id=s.sa_id and n.acct_id=q.acct_id and sa_type_Cd='PPD' 
AND SA_STATUS_FLG='20' AND P.CHAR_TYPE_CD='CM_LEGCY'
 group by adhoc_char_val