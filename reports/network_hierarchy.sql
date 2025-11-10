select * from (
select f2.id_value transformerCode,
(select id_value from D1_FACILITY_IDENTIFIER where facility_id=(select network_node from D1_NW_NODE 
where network_location_id=n1.network_location_id)) feeder
from d1_facility f1,D1_FACILITY_IDENTIFIER f2 ,D1_NW_LOC n1
where f2.facility_id=f1.facility_id and  f1.bus_obj_cd ='D1-Transformer'
and n1.facility_id=f1.facility_id ) sql1, 
(select f2.id_value feeder,
(select id_value from D1_FACILITY_IDENTIFIER where facility_id=(select network_node from D1_NW_NODE 
where network_location_id=n1.network_location_id)) substation
from d1_facility f1,D1_FACILITY_IDENTIFIER f2 ,D1_NW_LOC n1
where f2.facility_id=f1.facility_id and  f1.bus_obj_cd ='CM-Feeder'
and n1.facility_id=f1.facility_id )sql2
where sql1.feeder=sql2.feeder
and transformerCode in (
'D2Y37')
order by substation ,sql1.feeder