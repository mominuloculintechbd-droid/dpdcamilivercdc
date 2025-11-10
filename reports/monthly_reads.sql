SELECT 
    DI.ID_VALUE,
    ms.*
FROM 
    d1_dvc_cfg DC
JOIN 
    d1_dvc_identifier DI ON DC.D1_DEVICE_ID = DI.D1_DEVICE_ID
JOIN 
    d1_measr_comp MC ON DC.DEVICE_CONFIG_ID = MC.DEVICE_CONFIG_ID
JOIN 
    d1_measr_comp_identifier MI ON MC.MEASR_COMP_ID = MI.MEASR_COMP_ID
JOIN 
    d1_msrmt ms ON MI.MEASR_COMP_ID = ms.MEASR_COMP_ID
WHERE 
    DI.DVC_ID_TYPE_FLG = 'D1SN'
    AND DI.ID_VALUE in( '90134355')
    AND MI.ID_VALUE = 'kWh Daily'
    AND ms.MSRMT_DTTM IN (
        TO_DATE('2024-11-01', 'YYYY-MM-DD'),
        TO_DATE('2024-12-01', 'YYYY-MM-DD'),
        TO_DATE('2024-08-01', 'YYYY-MM-DD'));