select b.acct_id acc_id, c.d1_device_id,b.sa_id,c.cre_dttm as dateOfMigration,d.d1_install_dttm as installDT,

(select (extractvalue(xmltype('<XMLTEMP>' || FACT_DATA_AREA || '</XMLTEMP>'),'XMLTEMP/uploadData/meterSrNumber'))

from f1_fact f1 where f1.fact_id=a.fact_id) as msn,

(select (extractvalue(xmltype('<XMLTEMP>' || FACT_DATA_AREA || '</XMLTEMP>'),'XMLTEMP/uploadData/oldConsumerId'))

from f1_fact f1 where f1.fact_id=a.fact_id) as custID,

(select bseg_id from ci_bseg where end_dt=(select max(end_dt) from ci_bseg where sa_id=b.sa_id and bseg_stat_flg='50')and sa_id=b.sa_id and bseg_stat_flg='50') as latestBillID,

(select max(end_dt) from ci_bseg where sa_id=b.sa_id and bseg_stat_flg='50') as LatestBillDt ,

e.msrmt_dttm as lastReadingDt,e.measr_comp_id,

s1.start_msrmt, s1.end_msrmt,s1.quantity

from f1_fact a,ci_sa b,d1_dvc c,d1_install_evt d, d1_msrmt e, d1_usage_scalar_dtl s1 where

a.bus_obj_cd='CM-DPDCUploadDataMigration ' AND trunc(a.STATUS_UPD_dTTM)>='29-Jul-2023' AND a.BO_STATUS_CD='COMPLETE'

and b.sa_id=(extractvalue(xmltype('<XMLTEMP>' || FACT_DATA_AREA || '</XMLTEMP>'),'XMLTEMP/outputData/prepaidServiceAgreementId'))

and c.bo_status_cd='ACTIVE'

and c.d1_device_id=(extractvalue(xmltype('<XMLTEMP>' || FACT_DATA_AREA || '</XMLTEMP>'),'XMLTEMP/outputData/deviceId'))

and d.device_config_id=(extractvalue(xmltype('<XMLTEMP>' || FACT_DATA_AREA || '</XMLTEMP>'),'XMLTEMP/outputData/deviceConfigurationId'))

and d.bo_status_cd='CONN-COMM'

and e.measr_comp_id=(select measr_comp_id from d1_measr_comp where device_config_id=(extractvalue(xmltype('<XMLTEMP>' || FACT_DATA_AREA || '</XMLTEMP>'),'XMLTEMP/outputData/deviceConfigurationId')) and measr_comp_type_cd in('ES-KWH-TOT-1P-DAILY','ES-KWH-TOT-FWD-3P-DAILY'))

and e.msrmt_dttm=(select MAX(MSRMT_DTTM)from d1_msrmt where measr_comp_id=(select measr_comp_id from d1_measr_comp where device_config_id=(extractvalue(xmltype('<XMLTEMP>' || FACT_DATA_AREA || '</XMLTEMP>'),'XMLTEMP/outputData/deviceConfigurationId')) and measr_comp_type_cd in('ES-KWH-TOT-1P-DAILY','ES-KWH-TOT-FWD-3P-DAILY')))

and e.measr_comp_id=s1.measr_comp_id

and s1.end_dttm=e.msrmt_dttm

order by DATEOFMIGRATION asc