select t3.srch_char_val AS CUSTOMER_ID, sum(t6.calc_amt) AS Total_bill_amt,sum(t5.init_sq) AS total_consumption,(t4.start_dt) AS bill_start_dt
--,max(t4.end_dt) as bill_end_dt 
from ci_sa t1
inner join ci_sa_sp t2 on t1.sa_id=t2.sa_id
inner join ci_sp_char t3 on t2.sp_id=t3.sp_id and t3.char_type_cd='CM_LEGCY'
inner join ci_bseg t4 on t4.sa_id = t1.sa_id and t4.bseg_stat_flg='50'
inner join ci_bseg_sq t5 on t5.bseg_id=t4.bseg_id and uom_cd='KWH' and tou_cd = ' '
inner join ci_bseg_calc t6 on t6.bseg_id = t4.bseg_id --and t4.bseg_id='320999801319'
where sa_type_cd='PPD'--t1.sa_id='1147261448'
and t4.start_dt between  '11-OCT-12' and '12-OCT-12'
group by t3.srch_char_val, t4.start_dt