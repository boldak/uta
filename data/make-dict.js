let dict = [
    
    {mainForm:'край', tags:["s_geo_region"]},
    {mainForm:'район', tags:["s_geo_region"]},
    {mainForm:'область', tags:["s_geo_region"]},
    {mainForm:'губернія', tags:["s_geo_region"]},

    {mainForm:'республіка', tags:["s_geo_federation"]},
    {mainForm:'федерація', tags:["s_geo_federation"]},

    {mainForm:'штат', tags:["s_geo_adj_federation"]},
    {mainForm:'емірат', tags:["s_geo_adj_federation"]},
    
    {mainForm:'графство', tags:["s_geo_state"]},
    {mainForm:'штат', tags:["s_geo_state"]},

    {mainForm:'місто', tags:["s_geo_locality"]},
    {mainForm:'село', tags:["s_geo_locality"]},
    {mainForm:'селище', tags:["s_geo_locality"]}
]



dict = dict.map( d => ({
    mainForm: d,
    tags:["s_date_month"]
}))

let fs = require("fs")
fs.writeFileSync("./geo.dict.json", JSON.stringify(dict,null," "))