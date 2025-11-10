select d.adhoc_char_val custID, h.id_value MSN
from d1_sp s1,d1_sp_char d,
D1_INSTALL_EVT F, D1_DVC_CFG G, D1_DVC_IDENTIFIER H
where D.D1_SP_ID = s1.d1_sp_id
and d.char_type_cd='CM_LEGCY'
AND s1.D1_SP_ID = F.D1_SP_ID
AND F.DEVICE_CONFIG_ID = G.DEVICE_CONFIG_ID
AND F.D1_REMOVAL_DTTM IS NULL
AND G.D1_DEVICE_ID = H.D1_DEVICE_ID
AND H.DVC_ID_TYPE_FLG = 'D1SN'
AND LENGTH(H.ID_VALUE) = 8
and h.id_value in (select d2.id_value MSN
from d1_sp_char s1,d1_install_evt e1 , d1_dvc_cfg d1,d1_dvc_identifier d2
where s1.char_type_cd='CM_CPRLA' and s1.adhoc_char_val='32359610'
and s1.d1_sp_id=e1.d1_sp_id and e1.d1_removal_dttm is null
and d1.device_config_id=e1.device_config_id
and d2.d1_device_id=d1.d1_device_id
and length(d2.id_value)='8');