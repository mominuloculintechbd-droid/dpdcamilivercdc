SELECT COUNT(1) AS count,bus_obj_cd,bo_status_cd FROM d1_activity
WHERE TRUNC(CRE_DTTM) =TO_DATE ('2024-12-22','YYYY-MM-DD')
AND bus_obj_cd IN ('D1-RemoteConnect', 'D1-RemoteDisconnect')
GROUP BY bus_obj_cd, bo_status_cd