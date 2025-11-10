SELECT
    d2.id_value AS METER_NO,
    pn.entity_name AS CUSTOMER_NAME,
    p1.address1 AS ADDRESS,
    mob.contact_value AS MOBILE_NO,
    cust_det.cust_cat AS TARIFF,
    book.adhoc_char_val AS BOOK_CODE,
    DECODE(TRIM(mt.char_val), 'SINGLE', '1P', '3P') AS METER_PHASE,
    d.cont_qty AS SANCTION_LOAD,
    TO_CHAR(MAX(CASE WHEN rn = 1 THEN b.end_dt END), 'DD-MON-YYYY') AS MAX_DEMAND_DATE_1,
    ROUND(MAX(CASE WHEN rn = 1 THEN init_sq END), 2) AS MAX_DEMAND_1,
    TO_CHAR(MAX(CASE WHEN rn = 2 THEN b.end_dt END), 'DD-MON-YYYY') AS MAX_DEMAND_DATE_2,
    ROUND(MAX(CASE WHEN rn = 2 THEN init_sq END), 2) AS MAX_DEMAND_2,
    TO_CHAR(MAX(CASE WHEN rn = 3 THEN b.end_dt END), 'DD-MON-YYYY') AS MAX_DEMAND_DATE_3,
    ROUND(MAX(CASE WHEN rn = 3 THEN init_sq END), 2) AS MAX_DEMAND_3,
    nocs.descr AS NOCS_OFFICE,
    ROUND(MAX(init_sq) - d.cont_qty, 2) AS EXCESS_LOAD
FROM
    (
        SELECT
            bseg_id,
            init_sq,
            ROW_NUMBER() OVER (PARTITION BY bseg_id ORDER BY init_sq DESC) AS demand_rank
        FROM ci_bseg_sq
        WHERE uom_cd = 'KW'
    ) a,
    (
        SELECT
            b.*,
            ROW_NUMBER() OVER (PARTITION BY b.sa_id ORDER BY b.end_dt DESC) AS rn
        FROM ci_bseg b
        WHERE b.start_dt >= ADD_MONTHS(TRUNC(SYSDATE), -:months_back)
          AND b.end_dt <= TRUNC(SYSDATE)
          AND b.bseg_stat_flg = '50'
    ) b,
    ci_sa e,
    ci_sa_cont_qty d,
    ci_acct acct,
    ci_acct_per ap,
    ci_per per,
    ci_per_name pn,
    ci_prem p1,
    ci_prem_char pc,
    ci_char_val_l nocs,
    ci_sa_sp s2,
    ci_sp_char s1,
    d1_sp_char s3,
    d1_install_evt e1,
    d1_dvc_cfg d1,
    d1_dvc_identifier d2,
    (
        SELECT per_id, contact_value
        FROM c1_per_contdet
        WHERE comm_rte_type_cd = 'CELLPHONE'
          AND cnd_primary_flg = 'C1YS'
    ) mob,
    (
        SELECT sp_id, adhoc_char_val
        FROM ci_sp_char
        WHERE char_type_cd IN ('BOOK NUM', 'CM_BOOK')
    ) book,
    (
        SELECT sa_id, char_val AS cust_cat
        FROM (
            SELECT sa_id, char_val,
                   ROW_NUMBER() OVER (PARTITION BY sa_id ORDER BY effdt DESC) AS rn
            FROM ci_sa_char
            WHERE char_type_cd = 'CM_CUSCA'
        )
        WHERE rn = 1
    ) cust_det,
    (
        SELECT
            d1_sp_id,
            char_val
        FROM (
            SELECT
                d1_sp_id,
                char_val,
                ROW_NUMBER() OVER (PARTITION BY d1_sp_id ORDER BY effdt DESC) AS rn
            FROM d1_sp_char
            WHERE char_type_cd = 'CM_MTRTY'
        )
        WHERE rn = 1
    ) mt
WHERE
    a.demand_rank = 1
    AND a.bseg_id = b.bseg_id
    AND b.sa_id = e.sa_id
    AND b.sa_id = d.sa_id
    AND d.cont_qty_type_cd = 'SLOAD'
    AND d.effdt = (
        SELECT MAX(d1.effdt)
        FROM ci_sa_cont_qty d1
        WHERE d1.sa_id = d.sa_id
          AND d1.cont_qty_type_cd = 'SLOAD'
    )
    AND e.acct_id = acct.acct_id
    AND acct.acct_id = ap.acct_id
    AND ap.per_id = per.per_id
    AND per.per_id = pn.per_id
    AND per.per_id = mob.per_id (+)
    AND b.prem_id = p1.prem_id
    AND p1.prem_id = pc.prem_id
    AND pc.char_type_cd = 'CM_NOCS'
    AND pc.char_val = nocs.char_val
    AND nocs.char_type_cd = 'CM_NOCS'
    AND e.sa_id = s2.sa_id
    AND s2.sp_id = s1.sp_id
    AND s1.char_type_cd = 'CM_LEGCY'
    AND s3.char_type_cd = 'CM_LEGCY'
    AND s3.adhoc_char_val = s1.adhoc_char_val
    AND s3.d1_sp_id = e1.d1_sp_id
    AND e1.d1_removal_dttm IS NULL
    AND d1.device_config_id = e1.device_config_id
    AND d2.d1_device_id = d1.d1_device_id
    AND d2.dvc_id_type_flg = 'D1SN'
    AND s2.sp_id = book.sp_id (+)
    AND e.sa_id = cust_det.sa_id (+)
    AND s3.d1_sp_id = mt.d1_sp_id (+)
    AND rn <= 3
GROUP BY
    d2.id_value,
    pn.entity_name,
    p1.address1,
    mob.contact_value,
    cust_det.cust_cat,
    book.adhoc_char_val,
    DECODE(TRIM(mt.char_val), 'SINGLE', '1P', '3P'),
    d.cont_qty,
    nocs.descr,
    e.sa_id
HAVING MAX(init_sq) > d.cont_qty
ORDER BY
    nocs.descr,
    EXCESS_LOAD DESC
