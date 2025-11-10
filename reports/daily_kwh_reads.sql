--to check kwh reads
select COUNT(d.ID_VALUE) from d1_msrmt  PARTITION (P2024DEC) e,
d1_measr_comp_identifier a,D1_MEASR_COMP b,D1_DVC_CFG c,D1_Dvc_identifier d
WHERE e.measr_comp_id=a.measr_comp_id
and E.MSRMT_DTTM='2024-12-15' and trunc(e.cre_dttm)='2024-12-15'
and a.measr_comp_id=b.measr_comp_id
and a.ID_VALUE in ('kWh Daily')
and b.DEVICE_CONFIG_ID=c.DEVICE_CONFIG_ID
and c.D1_DEVICE_ID=d.D1_DEVICE_ID and d.DVC_ID_TYPE_FLG='D1SN';