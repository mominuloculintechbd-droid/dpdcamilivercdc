select t1.id_value as MSN,t2.adhoc_char_val as CustID ,
C4.ENTITY_NAME as Customer_Name, C1.ADDRESS1,C1.CITY,C1.COUNTY,C1.POSTAL,C1.GEO_CODE,
t2.d1_sp_id ,T7.DEVICE_TYPE_CD,t3.d1_install_dttm,T11.D1_GEO_LAT AS LATITUDE,
T11.D1_GEO_LONG AS LONGITUDE,T8.ACCT_ID,T8.CHAR_VAL AS BILLGRP,T9.CONT_QTY AS SANCTION_LOAD, T10.CHAR_VAL AS TARIFF,
(SELECT S1.SRCH_CHAR_VAL FROM D1_SP_CHAR S1 WHERE S1.D1_SP_ID=T3.D1_SP_ID AND S1.CHAR_TYPE_CD='BOOK NUM') AS BOOK_NUM,
(select id_value from D1_FACILITY_IDENTIFIER where facility_id=(select srch_char_val
from d1_sp_char s2 where S2.D1_SP_ID=T3.D1_SP_ID AND S2.CHAR_TYPE_CD='CM-DISNT') ) as FEEDERNAME,
(SELECT CHAR_VAL FROM CI_PREM_CHAR WHERE CHAR_TYPE_CD='CM_NOCS' AND
PREM_ID = (select ID_VALUE from D1_SP_IDENTIFIER where d1_sp_Id=t3.D1_SP_ID AND sp_id_type_flg='D1EP')) AS NOCS,
(select descr from CI_PREM_TYPE_L where prem_type_cd=(select prem_type_cd from ci_prem
where prem_id=(select ID_VALUE from D1_SP_IDENTIFIER where d1_sp_Id=t3.D1_SP_ID AND sp_id_type_flg='D1EP'))) as premiseType,
(select char_val from d1_sp_char where char_type_cd='CM-CPRCP' and d1_sp_id=t3.d1_sp_id) as workMode
from D1_DVC_IDENTIFIER t1 , cisadm.d1_sp_char t2 , cisadm.D1_INSTALL_EVT t3, cisadm.D1_DVC_CFG t4,d1_dvc T7,D1_SP T11
,ci_sa_sp T12, CI_SA T13, CI_ACCT_CHAR T8,CI_SA_CONT_QTY T9,CI_SA_CHAR T10,
CI_PER C1, CI_ACCT_PER C3, CI_PER_NAME C4
where t2.adhoc_char_val not like '%BAD%' and t2.char_type_cd='CM_LEGCY'
and t3.d1_sp_id =t2.d1_sp_id
and t3.device_config_id=t4.device_Config_id
and t4.d1_device_id=t1.d1_device_id
and t1.dvc_id_type_flg='D1SN'
AND LENGTH(t1.ID_VALUE) = 8
AND t3.D1_REMOVAL_DTTM IS NULL
and t1.D1_DEVICE_ID=T7.D1_DEVICE_ID
and T11.D1_SP_ID=t3.D1_SP_ID
AND T12.SP_ID = (select ID_VALUE from D1_SP_IDENTIFIER where d1_sp_Id=t3.D1_SP_ID AND sp_id_type_flg='D1EI') --CCB sp
AND T13.SA_ID = T12.SA_ID
AND T13.SA_TYPE_CD IN ('PPD','POPD')
AND T13.ACCT_ID=T8.ACCT_ID
AND T8.CHAR_TYPE_CD='CM_BILGR'
AND T9.CONT_QTY_TYPE_CD='SLOAD' AND T13.SA_ID=T9.SA_ID
AND T9.EFFDT=(SELECT MAX(EFFDT) FROM CI_SA_CONT_QTY WHERE CONT_QTY_TYPE_CD='SLOAD' AND SA_ID=T13.SA_ID)
AND T10.CHAR_TYPE_CD='CM_CUSCA'
AND T10.SA_ID=T13.SA_ID
AND T10.EFFDT=(SELECT MAX(EFFDT) FROM CI_SA_CHAR WHERE CHAR_TYPE_CD='CM_CUSCA' AND SA_ID=T13.SA_ID )
AND T8.ACCT_ID=C3.ACCT_ID AND C3.PER_ID=C1.PER_ID
AND C4.PER_ID=C1.PER_ID
order by t3.d1_install_dttm;