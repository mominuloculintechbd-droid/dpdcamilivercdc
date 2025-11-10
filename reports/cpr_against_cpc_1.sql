select  
    d.adhoc_char_val as custID, 
    h.id_value as MSN,
    d2.adhoc_char_val as CPR
from d1_sp s1
join d1_sp_char d 
    on d.d1_sp_id = s1.d1_sp_id 
   and d.char_type_cd = 'CM_LEGCY'
join d1_install_evt f 
    on f.d1_sp_id = s1.d1_sp_id 
   and f.d1_removal_dttm is null
join d1_dvc_cfg g 
    on g.device_config_id = f.device_config_id
join d1_dvc_identifier h 
    on h.d1_device_id = g.d1_device_id 
   and h.dvc_id_type_flg = 'D1SN' 
   and length(h.id_value) = 8
join d1_sp_char d2 
    on d2.d1_sp_id = s1.d1_sp_id 
   and d2.char_type_cd = 'CM_CPRLA'
where h.id_value in (
        select d2.id_value
        from d1_sp_char s1
        join d1_install_evt e1 on s1.d1_sp_id = e1.d1_sp_id
        join d1_dvc_cfg d1 on d1.device_config_id = e1.device_config_id
        join d1_dvc_identifier d2 on d2.d1_device_id = d1.d1_device_id
        where s1.char_type_cd = 'CM_CPRLA' 
          and s1.adhoc_char_val = '36653909'
          and e1.d1_removal_dttm is null
          and length(d2.id_value) = 8
    )
order by d.adhoc_char_val;