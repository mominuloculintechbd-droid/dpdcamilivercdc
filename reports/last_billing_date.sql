select srch_char_val ,max(b.end_dt) from ci_bseg b,ci_sa s1,ci_sa_sp s2,ci_sp_char s3
where s3.char_type_cd='CM_LEGCY' and s3.srch_char_val in ('16047860')
and b.sa_id=s1.sa_id
and s2.sa_id=s1.sa_id
and s3.sp_id=s2.sp_id and bseg_stat_flg='50' group by srch_char_val;