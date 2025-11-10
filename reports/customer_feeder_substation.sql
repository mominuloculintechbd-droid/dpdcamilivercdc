SELECT 
    s1.adhoc_char_val AS custID,
    d2.id_value,
    TRUNC(s2.cre_dttm) AS migrationDate,
    e1.d1_install_dttm,
    f1.id_value AS TransformerCode,
    r1.id_value AS feeder,
    l2.descr100,
    -- Substation Code
    (SELECT r3.id_value 
     FROM D1_FACILITY_IDENTIFIER r3 
     WHERE r3.facility_id = (
         SELECT n3.network_node 
         FROM D1_NW_NODE n3 
         WHERE n3.network_location_id = (
             SELECT n1.network_location_id 
             FROM D1_FACILITY_IDENTIFIER f2, D1_NW_LOC n1, D1_FACILITY d3
             WHERE f2.facility_id = d3.facility_id
               AND d3.facility_id = r1.facility_id
               AND n1.facility_id = d3.facility_id
               AND d3.bus_obj_cd = 'CM-Feeder'
         )
     )
    ) AS SubstationCode,
    -- Substation Name
    (SELECT l4.descr100
     FROM D1_FACILITY_L l4
     WHERE l4.facility_id = (
         SELECT n3.network_node 
         FROM D1_NW_NODE n3 
         WHERE n3.network_location_id = (
             SELECT n1.network_location_id 
             FROM D1_FACILITY_IDENTIFIER f2, D1_NW_LOC n1, D1_FACILITY d3
             WHERE f2.facility_id = d3.facility_id
               AND d3.facility_id = r1.facility_id
               AND n1.facility_id = d3.facility_id
               AND d3.bus_obj_cd = 'CM-Feeder'
         )
     )
    ) AS SubstationName,
    P.CHAR_VAL AS NOCS,
    l.descr AS nocsDescr
FROM 
    d1_sp_char s1,
    d1_sp s2,
    d1_install_evt e1,
    d1_dvc_cfg d1,
    d1_dvc_identifier d2,
    D1_FACILITY_IDENTIFIER f1,
    d1_facility f3,
    d1_sp_facility f2,
    D1_FACILITY_IDENTIFIER r1,
    D1_NW_NODE n2,
    D1_NW_LOC n1,
    D1_FACILITY_L l2,
    d1_sp_identifier s3,
    CI_PREM_CHAR p,
    ci_char_val_l l
WHERE 
    s1.char_type_cd = 'CM_LEGCY'
    AND s2.d1_sp_id = s3.d1_sp_id
    AND s3.SP_ID_TYPE_FLG = 'D1EP'
    AND e1.d1_removal_dttm IS NULL
    AND s3.ID_VALUE = p.PREM_ID
    AND p.char_type_cd = 'CM_NOCS'
    AND p.char_val = l.char_val
    AND l.descr IN (
        'Adabor','Banasree','Banglabazar','Bangshal','Demra','Dhanmondi',
        'Fatulla','Jigatola','Kazla','Khilgaon','Mugdapara','Paribag',
        'Postogola','Rajarbag','Satmasjid','Shere-e-Bangla Nagar','Shytaklakha'
    )
    AND s1.d1_sp_id = e1.d1_sp_id
    AND s1.d1_sp_id = s2.d1_sp_id
    AND d1.device_config_id = e1.device_config_id
    AND dvc_id_type_flg = 'D1SN'
    AND d2.d1_device_id = d1.d1_device_id
    AND f2.d1_sp_id = s1.d1_sp_id
    AND f3.bus_obj_cd = 'D1-Transformer'
    AND f2.facility_id = f1.facility_id
    AND f3.facility_id = f1.facility_id
    AND n1.facility_id = f1.facility_id
    AND n1.network_location_id = n2.network_location_id
    AND n2.network_node = r1.facility_id
    AND r1.facility_id = l2.facility_id;