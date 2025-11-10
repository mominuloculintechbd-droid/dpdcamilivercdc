SELECT * FROM (
SELECT  DISTINCT ROUND (MAX(init_sq),2)as MaximumDemand ,d.cont_qty AS SaanctionLoad, 
CASE WHEN e.sa_type_cd='PPD' THEN 'PREPAID' ELSE 'POST PAID' END AS Account_type,e.acct_id,p1.address1, 
s1.adhoc_char_val custID,d2.id_value MSN,f1.id_value Feeder,PC1.CHAR_vAL NOCS,
(SELECT l1.DESCR FROM CI_CHAR_VAL_L l1 WHERE l1.CHAR_TYPE_CD='CM_NOCS' AND l1.CHAR_vAL=PC1.CHAR_vAL) NOCsName
FROM ci_bseg_sq a,ci_bseg b,CI_PREM_CHAR PC1,CI_PREM_CHAR PC2,CI_PREM_CHAR PC3,ci_sa_cont_qty d,ci_sa e,
ci_sp_char s1,ci_sa_sp s2,d1_sp_char s3,d1_install_evt e1,d1_dvc_cfg d1,d1_dvc_identifier d2,
d1_sp_char s4,D1_NW_LOC n1,D1_NW_NODE n2,D1_FACILITY_IDENTIFIER f1,CI_PREM p1
WHERE a.bseg_id=b.bseg_id
and b.prem_id=PC1.prem_id
AND PC1.PREM_ID = PC2.PREM_ID
AND PC1.PREM_ID =PC3.PREM_ID
and b.sa_id=d.sa_id and b.prem_id=p1.prem_id
and B.sa_id=e.sa_id and e.sa_type_cd='PPD' and s2.sa_id=e.sa_id
and  s1.char_type_cd='CM_LEGCY' and s1.sp_id=s2.sp_id
and s3.char_type_cd='CM_LEGCY' and s3.adhoc_char_val=s1.adhoc_char_val --and s3.adhoc_char_val='17430104'
and s3.d1_sp_id=e1.d1_sp_id and s3.d1_sp_id= s4.d1_sp_id
and d1.device_config_id=e1.device_config_id and e1.d1_removal_dttm is null
and d2.d1_device_id=d1.d1_device_id and d2.dvc_id_type_flg='D1SN'
AND PC1.CHAR_TYPE_CD='CM_NOCS'
AND PC2.CHAR_TYPE_CD='CM_ZONE'
AND PC3.CHAR_TYPE_CD='CM_CRCLE'
and PC1.CHAR_vAL=(SELECT l1.CHAR_VAL FROM CI_CHAR_VAL_L l1 WHERE l1.CHAR_TYPE_CD='CM_NOCS' AND l1.DESCR='Demra')
--and PC2.CHAR_vAL=(SELECT l2.CHAR_VAL FROM CI_CHAR_VAL_L l2 WHERE l2.CHAR_TYPE_CD='CM_ZONE'  AND l2.DESCR='North')
--and PC3.CHAR_vAL=(SELECT l3.CHAR_VAL FROM CI_CHAR_VAL_L l3 WHERE l3.CHAR_TYPE_CD='CM_CRCLE' AND l3.DESCR='Azimpur')
and UOM_CD='KW' and d.cont_qty_type_cd='SLOAD' and d.effdt = (
    SELECT MAX(d1.effdt)
    FROM ci_sa_cont_qty d1
    WHERE d1.sa_id = d.sa_id
      AND d1.cont_qty_type_cd = 'SLOAD'
)
and b.start_dt>='01-Jul-2025' AND b.end_dt<='31-Jul-2025'
and s4.char_type_cd='CM-DISNT' and s4.srch_char_val=n1.facility_id
and n1.network_location_id=n2.network_location_id and n2.network_node_type_flg='D1-Feeder'
and n2.network_node=f1.facility_id
group by d.cont_qty,e.sa_type_cd,e.acct_id,PC1.CHAR_vAL,s1.adhoc_char_val,d2.id_value,f1.id_value,p1.address1)
WHERE  MaximumDemand>SaanctionLoad;