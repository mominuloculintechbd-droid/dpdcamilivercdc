select d.adhoc_char_val custID, h.id_value MSN,
to_date (S1.cre_dttm,'dd-Mon-rrrr') as migration_date,  to_char (S1.cre_dttm,'Mon-rrrr') as mon_yr, f.d1_install_dttm Installed_Date
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