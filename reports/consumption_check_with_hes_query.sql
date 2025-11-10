select a.adhoc_char_val as CUST_ID,T11.ID_VALUE AS MSN ,T10.DEVICE_CONFIG_ID,T9.MEASR_COMP_ID, to_char(T1.MSRMT_DTTM,'MON-YYYY') MONTH,T1.MSRMT_DTTM startDate,T2.MSRMT_DTTM endDate,T1.READING_VAL as startRead,T2.READING_VAL as endRead,(T2.READING_VAL-T1.READING_VAL) as consumption
from D1_DVC_IDENTIFIER T11 ,
D1_DVC_CFG T10,D1_MEASR_COMP T9, d1_sp_char a,
d1_msrmt T1,d1_msrmt T2
where T11.DVC_ID_TYPE_FLG='D1SN' --AND T11.ID_VALUE='90010359'   
AND T10.D1_DEVICE_ID=T11.D1_DEVICE_ID
AND T10.CRE_DTTM < '01-Jul-2023'
AND T9.DEVICE_CONFIG_ID=T10.DEVICE_CONFIG_ID
AND T1.MEASR_COMP_ID=T9.MEASR_COMP_ID and t1.msrmt_use_flg<>'D101' 
and t9.measr_comP_type_CD in  ('ES-KWH-TOT-1P-DAILY','ES-KWH-TOT-FWD-3P-DAILY','WS-KWH-TOT-1P-DAILY','WS-KWH-TOT-FWD-3P-DAILY', 'ST-KWH-TOT-1P-DAILY','ST-KWH-TOD3-FWD-3P-DAILY')
and  a.char_type_cd='CM_LEGCY' and a.d1_sp_id=(select d1_sp_id from d1_install_evt where device_config_id=T9.DEVICE_CONFIG_ID)
and to_date(t1.msrmt_dttm,'dd-Mon-rrrr hh24:mi:ss' )= to_date('01-Oct-2023 00:00:00','dd-Mon-rrrr hh24:mi:ss' )
AND T2.MEASR_COMP_ID=T9.MEASR_COMP_ID and t2.msrmt_use_flg<>'D101'  and to_date(t2.msrmt_dttm,'dd-Mon-rrrr hh24:mi:ss' )= to_date('01-Nov-2023 00:00:00','dd-Mon-rrrr hh24:mi:ss' )