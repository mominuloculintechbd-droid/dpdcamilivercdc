WITH d1_sp_char_merge AS (
    SELECT
        a.d1_sp_id,
        a.char_type_cd,
        a.adhoc_char_val
    FROM
        cisadm.d1_sp_char a
    WHERE
        char_type_cd IN ( 'CM_LEGCY', 'CM_PREAC' )
)
SELECT distinct
         TRIM(ci_prem_char.char_val)                                Location_Code,
            ci_char_val_l.descr                                  nocs_name,
    substr(d1_sp_char.leg_cust_id_no,
           1,
           instr(d1_sp_char.leg_cust_id_no, ',', 1) - 1) customer_num,

    ci_per_name.entity_name                              customer_name,
    (
        SELECT
            max(adhoc_char_val)
        FROM
            cisadm.ci_per_char
        WHERE
                per_id = ci_per.per_id
            AND char_type_cd = 'FATHER  '
    )                                                                                                 father_name,
    (
        SELECT
            max(adhoc_char_val)
        FROM
            cisadm.ci_per_char
        WHERE
                per_id = ci_per.per_id
            AND char_type_cd = 'MOTHER  '
    )                                                                                                 mother_name,
    (
        SELECT
            max(adhoc_char_val)
        FROM
            cisadm.ci_per_char
        WHERE
                per_id = ci_per.per_id
            AND char_type_cd = 'SPOUSE  '
    )                                                                                                 spouse_name,
    ci_prem.address1
    || ','
    || ci_prem.address2
    || ','
    || ci_prem.address3
    || ','
    || ci_prem.address4
    || ','
    || ci_prem.county
    || ','
    || ci_prem.city
    || ','
    || ci_prem.geo_code
    || ','
    || ci_prem.postal
    || ','
    || ci_prem.country                                   address,
     c1_per_mob.contact_value                             mobile_no,
     'Not Available'                                       sex,
       ci_per_nid.per_id_nbr                             nid,
    c1_per_email.contact_value                           email,
     decode(ci_prem_type_l.descr, 'Freedom Fighter', 'Yes', 'No')          is_freedomfighter,
    ci_prem.prem_type_cd                                                      sect_code,
    decode(ci_acct.cust_cl_cd, 'GOV', 'Yes', 'No')                                               is_govt,
    sanc_ld.cont_qty                                     sanction_load,
    'Not Available'                                       customer_state,
    d1_dvc_identifier.id_value                           meter_no,
     decode(Trim(meter_type.char_val),'SINGLE','1P','3P')   phase,
    'AMI'                                                   prepaid_medium,
    'Online Meter'                                           meter_type,
    decode(Trim(d1_dvc.bo_status_cd),'ACTIVE','Running','Uninstalled') meter_status,
    TRIM(CUST_DET.CUST_CAT)                                      TARIFF,

    --CUST_DET.WORK_MODE WORK_MODE,
    d1_install_evt.d1_install_dttm                       conn_date,


    --d1_dvc.device_type_cd                                meter_type, 
    --DEVICE_LOCATION,
    --d1_sp.d1_geo_lat                                     latitude,
    --d1_sp.d1_geo_long                                    longitude,
 
    feeder.feeder_cd                                                                                  feeder_no,
    feeder.feeder_desc                                                                                feeder_name,
    (
        SELECT
            adhoc_char_val
        FROM
            cisadm.ci_sp_char
        WHERE
                sp_id = ci_sp.sp_id
            AND char_type_cd IN ('BOOK NUM', 'CM_BOOK') 
    )                                                                                                 book_code,
   
   
    'AMI'                                                                                             project_name,
    '1' METER_OWNER,
  '' TARIFF_PROGRAM_ID,
   '' PASSPORT,
   '' TIN,
   null DOB,
   'Landis+Gyr' METER_COMPANY,
   '' METER_MODEL,
   '' DCU_MOTHER_NO,
   '' HES_NAME,
   '' SEAL_NO,
   '' SEAL_DATE

    --d1_dvc.manufacturer_cd                               manufacturer,
    --d1_dvc.d1_model_cd                                   meter_model,
    --CUST_DET.BOOK_NUM BOOK_NUM,
    --CUST_DET.BILL_GRP BILL_GRP,
    --b.descr,


FROM
    cisadm.ci_acct_per,
    cisadm.ci_per,
    cisadm.ci_per_name,
    cisadm.ci_prem_char,
    cisadm.ci_prem,
    cisadm.ci_char_val_l,
    cisadm.ci_prem_type_l,
    (
        SELECT
            a.per_id,
            a.id_type_cd,
            a.per_id_nbr
        FROM
            cisadm.ci_per_id a
        WHERE
            id_type_cd = 'BNID '
    )  ci_per_nid,
    (
        SELECT
            per_id,
            contact_value
        FROM
            cisadm.c1_per_contdet
        WHERE
                comm_rte_type_cd = 'PRIMARYEMAIL'
            AND cnd_primary_flg = 'C1YS'
    )  c1_per_email,
    (
        SELECT
            ci_sp_char.sp_id,
            a.id_value    feeder_cd,
            b.descr100    feeder_desc
        FROM
            cisadm.d1_facility_identifier,
            cisadm.ci_sp_char,
            cisadm.d1_nw_loc,
            cisadm.d1_nw_node,
            cisadm.d1_facility_l             b,
            cisadm.d1_facility_identifier    a
        WHERE
                d1_facility_identifier.facility_id = d1_nw_loc.facility_id
            AND d1_facility_identifier.facility_id = ci_sp_char.char_val_fk1
            AND d1_nw_node.network_location_id = d1_nw_loc.network_location_id
            AND d1_nw_node.network_node = b.facility_id
            AND b.facility_id = a.facility_id
            AND char_type_cd = 'CM-DISNT'
    )  feeder,
    (
        SELECT
            ci_sa.sa_id,
            ci_sa_cont_qty.cont_qty,
            ci_sa_char.char_val
        FROM
            cisadm.ci_sa,
            cisadm.ci_sa_cont_qty,
            cisadm.ci_sa_char
        WHERE
                ci_sa.sa_id = ci_sa_cont_qty.sa_id
            AND ci_sa.sa_id = ci_sa_char.sa_id
            AND ci_sa_char.effdt = (
                                    SELECT
                                        max(effdt) effdt
                                    FROM
                                        cisadm.ci_sa_char a, cisadm.ci_sa b
                                    WHERE a.sa_id = b.sa_id
                                    and a.sa_id = ci_sa_char.sa_id
                                    and TRIM(sa_type_cd) IN ( 'PPD', 'POPD' )
                                    and char_type_cd = 'CM_CUSCA'
                                    )
            AND ci_sa_cont_qty.effdt = (
                                        SELECT
                                            max(effdt) effdt
                                        FROM
                                            cisadm.ci_sa_cont_qty a, cisadm.ci_sa b
                                        WHERE a.sa_id = b.sa_id
                                        and a.sa_id = ci_sa_cont_qty.sa_id
                                        and TRIM(sa_type_cd) IN ( 'PPD', 'POPD' )
                                        and char_type_cd = 'CM_CUSCA'
                                       )
            AND TRIM(ci_sa_cont_qty.cont_qty_type_cd) = 'SLOAD'
            AND char_type_cd = 'CM_CUSCA'
            AND TRIM(sa_type_cd) IN ( 'PPD', 'POPD' )
    )  sanc_ld,

    (
        SELECT
            per_id,
            contact_value
        FROM
            cisadm.c1_per_contdet
        WHERE
                comm_rte_type_cd = 'CELLPHONE'
            AND cnd_primary_flg = 'C1YS'
    ) c1_per_mob,
    (
        SELECT
            per_id,
            contact_value
        FROM
            (
                SELECT
                    per_id,
                    contact_value,
                    ROW_NUMBER()
                    OVER(PARTITION BY per_id
                         ORDER BY
                             contact_value
                    ) row_num
                FROM
                    cisadm.c1_per_contdet
                WHERE
                        comm_rte_type_cd = 'CELLPHONE'
                   AND cnd_primary_flg = 'C1NO'
            )
        WHERE
            row_num = 1
    ) c1_per_sec_mob,
    (
        SELECT
            per_id,
            contact_value
        FROM
            (
                SELECT
                    per_id,
                    contact_value,
                    ROW_NUMBER()
                    OVER(PARTITION BY per_id
                         ORDER BY
                             contact_value
                    ) row_num
                FROM
                    cisadm.c1_per_contdet
                WHERE
                        comm_rte_type_cd = 'CELLPHONE'
                    AND cnd_primary_flg = 'C1NO'
            )
        WHERE
            row_num = 2
    ) c1_per_sec_mob_2,
    (
        SELECT
            per_id,
            contact_value
        FROM
            (
                SELECT
                    per_id,
                    contact_value,
                    ROW_NUMBER()
                    OVER(PARTITION BY per_id
                         ORDER BY
                             contact_value
                    ) row_num
                FROM
                    cisadm.c1_per_contdet
                WHERE
                        comm_rte_type_cd = 'CELLPHONE'
                    AND cnd_primary_flg = 'C1NO'
            )
        WHERE
            row_num = 3
    ) c1_per_sec_mob_3,
    cisadm.ci_acct,
    cisadm.ci_sa,
    cisadm.ci_sp,
    cisadm.d1_sp_identifier,
    cisadm.d1_sp,
    /* (
        SELECT
            decode(sa_status_flg, 20, 'Active', 30, 'Pending Stop',
                   40, 'Stopped', 50, 'Reactivated', 60,
                  'Closed', 70, 'Canceled')
        FROM
            cisadm.ci_sa
        WHERE
                acct_id = ci_acct.acct_id
            AND sa_type_cd IN ( 'PPD     ', 'POPD    ' )
    )                                                                                                   customer_state, */



    /* (
       SELECT
           adhoc_char_val
        FROM
           cisadm.ci_sp_char
        WHERE
                sp_id = ci_sp.sp_id
            AND char_type_cd = 'BOOK NUM'
    )                                                                                                 book_code, */
    (
        SELECT
            d1_sp_id,
            LISTAGG(adhoc_char_val, ',') WITHIN GROUP(
            ORDER BY
                char_type_cd
            ) leg_cust_id_no
        FROM
            d1_sp_char_merge
        GROUP BY
            d1_sp_id
    ) d1_sp_char,
     (
        SELECT A.d1_sp_id, (B.char_val) char_val
        FROM
            (SELECT
                d1_sp_id,
                MAX(effdt) effdt
            FROM
                cisadm.d1_sp_char
            WHERE
                char_type_cd = 'CM_MTRTY'
            GROUP BY
                d1_sp_id) A, 
            cisadm.d1_sp_char B
        where A.d1_sp_id = B.d1_sp_id
        and A.effdt = B.effdt
        and B.char_type_cd = 'CM_MTRTY'            
   
    )  meter_type,
    cisadm.d1_install_evt,
    cisadm.d1_dvc_cfg,
    cisadm.d1_dvc,
    cisadm.d1_dvc_identifier,

    (SELECT A.SA_ID, A.CUST_CAT, A.SANC_LD, A.BOOK_NUM, A.BILL_GRP,
        NVL(CASE WHEN TRIM(B.WORK_MODE) = 'CPC' THEN 'CPC' WHEN  TRIM(B.WORK_MODE) = 'CPR' THEN 'CPR' END,'REG') WORK_MODE
        FROM (SELECT * FROM(SELECT A.SA_ID SA_ID, A.CHAR_VAL CUST_CAT,RANK() OVER (PARTITION BY A.SA_ID ORDER BY A.EFFDT DESC) RAN1,
        B.CONT_QTY SANC_LD,RANK() OVER (PARTITION BY B.SA_ID ORDER BY B.EFFDT) RAN,
        D.ADHOC_CHAR_VAL BOOK_NUM, J.CHAR_VAL BILL_GRP, D.SP_ID
        FROM cisadm.CI_SA_CHAR A, cisadm.CI_SA_CONT_QTY B, cisadm.CI_SA_SP C, cisadm.CI_SP_CHAR D, cisadm.CI_SA I, cisadm.CI_ACCT_CHAR J
        WHERE A.SA_ID = B.SA_ID
        AND A.CHAR_TYPE_CD = 'CM_CUSCA'
        AND B.CONT_QTY_TYPE_CD = 'SLOAD   '
        AND B.SA_ID = C.SA_ID
        AND C.SP_ID = D.SP_ID
        AND D.CHAR_TYPE_CD IN ('BOOK NUM', 'CM_BOOK') 
        AND A.SA_ID = I.SA_ID
        AND I.ACCT_ID = J.ACCT_ID
        AND J.CHAR_TYPE_CD = 'CM_BILGR'
        AND I.SA_TYPE_CD IN ('PPD','POPD'))WHERE RAN = 1 AND RAN1 = 1) A LEFT JOIN 
        (SELECT SP_ID SP_WORK_MODE, CHAR_VAL WORK_MODE FROM cisadm.CI_SP_CHAR
        WHERE CHAR_TYPE_CD = 'CM-CPRCP') B
        ON A.SP_ID = B.SP_WORK_MODE) CUST_DET, cisadm.CI_PREM A, cisadm.CI_PREM_TYPE_L B
WHERE
    ci_acct_per.per_id = ci_per.per_id
      AND ci_per.per_id = ci_per_name.per_id
    AND ci_per.per_id = c1_per_mob.per_id (+)
    AND ci_per.per_id = ci_per_nid.per_id (+)
    AND ci_per.per_id = c1_per_email.per_id (+)
    AND ci_per.per_id = c1_per_sec_mob.per_id (+)
   AND ci_per.per_id = c1_per_sec_mob_2.per_id (+)
   AND ci_per.per_id = c1_per_sec_mob_3.per_id (+)
   AND ci_sa.sa_id = sanc_ld.sa_id (+)
    AND ci_acct_per.acct_id = ci_acct.acct_id --AND CI_ACCT.ACCT_ID='7227747959'---'9171447535'   --'7227747959'
   
   

    AND ci_acct.mailing_prem_id = ci_prem.prem_id
    AND ci_prem.prem_id = ci_prem_char.prem_id
    AND a.prem_id = ci_prem.prem_id
    AND a.prem_type_cd = b.prem_type_cd
    AND ci_prem_char.char_type_cd = 'CM_NOCS'
    AND ci_char_val_l.char_type_cd = 'CM_NOCS'
    AND ci_char_val_l.char_val = ci_prem_char.char_val
    AND ci_prem.prem_id = ci_sp.prem_id
    AND ci_sp.sp_id = d1_sp_identifier.id_value
    AND d1_sp_identifier.sp_id_type_flg = 'D1EI'
    AND d1_install_evt.d1_removal_dttm IS NULL
    AND ci_acct.acct_id = ci_sa.acct_id
    AND d1_sp_identifier.d1_sp_id = d1_sp.d1_sp_id
    AND d1_sp.d1_sp_id = d1_sp_char.d1_sp_id
    AND d1_sp.d1_sp_id = d1_install_evt.d1_sp_id
    AND d1_install_evt.device_config_id = d1_dvc_cfg.device_config_id
   AND d1_dvc_cfg.d1_device_id = d1_dvc.d1_device_id
    AND d1_dvc.d1_device_id = d1_dvc_identifier.d1_device_id
    AND d1_sp.d1_sp_id = meter_type.d1_sp_id
    AND ci_prem.prem_type_cd = ci_prem_type_l.prem_type_cd
    AND ci_per_name.entity_name NOT LIKE 'PROD TEST%'
    AND TRIM(ci_sa.sa_type_cd) IN ( 'PPD', 'POPD' )
    AND ci_sa.SA_ID = CUST_DET.SA_ID
    AND feeder.sp_id = ci_sp.sp_id
    AND d1_dvc_identifier.id_value not like '%BAD'
    AND d1_dvc_identifier.id_value not like '%DUP'
  
