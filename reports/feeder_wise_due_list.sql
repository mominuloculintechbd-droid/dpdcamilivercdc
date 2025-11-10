select table1.*,(select sum(q1.tot_amt) amount from ci_ft q1 ,cisadm.ci_acct a ,cisadm.ci_sa b ,cisadm.ci_sa_sp c,
cisadm.ci_Sp_char d  where q1.sa_id=b.sa_id AND a.acct_id=b.acct_id and b.sa_id=c.sa_id and c.sp_id=d.sp_id
and b.sa_type_cd='PPD' and d.char_type_cd='CM_LEGCY' 
and freeze_sw='Y'
and d.adhoc_Char_val=table1.custid
and b.SA_STATUS_FLG='20'
) amount ,
(select max(p1.ilm_dt)LastPayDate from CI_PAY_EVENT p1, CI_PAY_TNDR p2, cisadm.ci_acct a ,
cisadm.ci_sa b ,cisadm.ci_sa_sp c,cisadm.ci_Sp_char d  
where p1.pay_event_id=p2.pay_event_id
and p2.payor_acct_id=a.acct_id
and a.acct_id=b.acct_id and b.sa_id=c.sa_id and c.sp_id=d.sp_id
and b.sa_type_cd='PPD' and d.char_type_cd='CM_LEGCY'
and d.adhoc_Char_val=table1.custid
and b.SA_STATUS_FLG='20')LastPayDate
from (select s1.adhoc_char_val custID,d2.id_value,trunc(s2.cre_dttm) migrationDate, e1.d1_install_dttm,
f1.id_value TransformerCode, r1.id_value feeder, l2.descr100,
(select r3.id_value from D1_FACILITY_IDENTIFIER r3 where facility_id=(select network_node from D1_NW_NODE 
where network_location_id =(select n1.network_location_id from D1_FACILITY_IDENTIFIER f2 ,D1_NW_LOC n1,d1_facility d3
where f2.facility_id=d3.facility_id and d3.facility_id=r1.facility_id
and n1.facility_id=d3.facility_id and d3.bus_obj_cd='CM-Feeder'))) Substation ,P.CHAR_VAL NOCS, l.descr nocsDescr
from d1_sp_char s1, d1_sp s2,
d1_install_evt e1,d1_dvc_cfg d1,d1_dvc_identifier d2, D1_FACILITY_IDENTIFIER f1,d1_facility f3, d1_sp_facility f2,
D1_FACILITY_IDENTIFIER r1, D1_NW_NODE n2,D1_NW_LOC n1,D1_FACILITY_L l2,
d1_Sp_identifier s3,CI_PREM_CHAR p,ci_char_val_l l
where s1.char_type_cd='CM_LEGCY' and  s2.d1_sp_id=s3.d1_sp_id and s3.SP_ID_TYPE_FLG='D1EP' 
and e1.d1_removal_dttm is null
AND S3.ID_VALUE=p.PREM_ID 
and l.descr = (
'Paribag'
)
and p.char_type_cd='CM_NOCS' and p.char_val=l.char_val
and s1.d1_sp_id=e1.d1_sp_id and s1.d1_sp_id=s2.d1_sp_id
and d1.device_config_id=e1.device_config_id
and dvc_id_type_flg='D1SN' and d2.d1_device_id=d1.d1_device_id
and f2.d1_sp_id=s1.d1_sp_id and  f3.bus_obj_cd ='D1-Transformer'
and f2.facility_id=f1.facility_id and f3.facility_id=f1.facility_id
and n1.facility_id=f1.facility_id and n1.network_location_id=n2.network_location_id
and n2.network_node=r1.facility_id and r1.facility_id=l2.facility_id
) table1;