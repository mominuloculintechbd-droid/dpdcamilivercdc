select Id_value  as MSN, g.bo_status_cd ,max (g.STATUS_UPD_DTTM  )
from d1_install_evt g
inner join d1_dvc_cfg h on h.DEVICE_CONFIG_ID=g.DEVICE_CONFIG_ID
inner join d1_dvc_identifier i on i.D1_DEVICE_ID=h.D1_DEVICE_ID
where g.bo_status_cd='DISCONN-COMM'
group by Id_value  ,g.bo_status_cd