SELECT 
    t2.pay_dt,
    TO_CHAR(t2.CRE_DTTM, 'hh24:mi:ss') AS tim,
    t1.tender_amt,
    t3.tndr_source_cd,
    t4.descr,
    d.adhoc_char_val AS custID,
    h.id_value AS MSN,
    p.char_val AS NOCS,
    l.descr AS NOCS_NAME,
    ci_pay_evt_char.adhoc_char_val AS msgid,
    DECODE(ci_pay.PAY_STATUS_FLG,
           10, 'Incomplete',
           20, 'Error',
           30, 'Freezable',
           50, 'Success',
           60, 'Canceled') AS ORDER_STATUS
FROM 
    CI_PAY_TNDR T1
    JOIN CI_PAY_EVENT T2 ON T1.PAY_EVENT_ID = T2.PAY_EVENT_ID
    JOIN CI_PAY ci_pay ON ci_pay.PAY_EVENT_ID = T2.PAY_EVENT_ID
    JOIN CI_TNDR_CTL T3 ON T1.tndr_ctl_id = T3.tndr_ctl_id
    JOIN CI_TNDR_SRCE_L T4 ON T3.tndr_source_cd = T4.tndr_source_cd
    JOIN cisadm.ci_acct A ON A.acct_id = T1.payor_acct_id
    JOIN cisadm.ci_sa B ON A.acct_id = B.acct_id
    JOIN cisadm.ci_sa_sp C ON B.sa_id = C.sa_id
    JOIN cisadm.ci_sp_char D ON C.sp_id = D.sp_id AND D.char_type_cd = 'CM_LEGCY'
    JOIN CISADM.D1_SP_CHAR E ON E.adhoc_char_val = D.adhoc_char_val AND E.char_type_cd = 'CM_LEGCY'
    JOIN d1_install_evt F ON E.d1_sp_id = F.d1_sp_id
    JOIN d1_dvc_cfg G ON F.device_config_id = G.device_config_id
    JOIN d1_dvc_identifier H ON G.d1_device_id = H.d1_device_id AND H.dvc_id_type_flg = 'D1SN'
    JOIN d1_Sp_identifier S1 ON E.d1_sp_id = S1.d1_sp_id AND S1.SP_ID_TYPE_FLG = 'D1EP'
    JOIN CI_PREM_CHAR P ON S1.ID_VALUE = P.PREM_ID AND P.char_type_cd = 'CM_NOCS'
    JOIN ci_char_val_l L ON P.char_val = L.char_val
    LEFT JOIN cisadm.ci_pay_evt_char 
        ON ci_pay_evt_char.pay_event_id = T2.pay_event_id
        AND ci_pay_evt_char.char_type_cd = 'CM_PAYTR'
WHERE 
    B.sa_type_cd = 'PPD'
    
    and ci_pay_evt_char.adhoc_char_val in('253293UBA00005231090903550211',
'253293UBA02467283091000000268',
'253293UBA02512082090334340584',
'253293UBA04552459090436240637',
'253293UBA04638000092302390004',
'253293UBA04852387091436330525',
'253293UBA05323747083142590848',
'253293UBA05323747083159320032',
'253293UBA05426013083150390130',
'253293UBA05590851092232500011',
'253293UBA05757506092424330686',
'253293UBA06622693092824460899',
'253293UBA06824347091002330705',
'253293UBA07065832091540020650',
'253293UBA07130367083159280422',
'253293UBA07317360092226270449')
ORDER BY 
    t2.CRE_DTTM DESC;