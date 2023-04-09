const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');

const currentDate = year + month + day;

    hjjhm=currentDate;
    // alert(hjjhm)
    $("button").on("click",function(){
      // alert(3)
 
   
   var jhm=$("#jhm").val();

   jhm = atob(jhm);
   // alert(jhm)
    if(jhm==hjjhm){
       // continue
    }else{
       alert('激活码不正确')
       return
    }
 

 // alert('正在激活');
 

  //设置cooike
  // 对Date的扩展，将 Date 转化为指定格式的String
  // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
  // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
  Date.prototype.Format = function(fmt) { 
    var o = {
      "M+": this.getMonth() + 1,
      //月份
      "d+": this.getDate(),
      //日
      "H+": this.getHours(),
      //小时
      "m+": this.getMinutes(),
      //分
      "s+": this.getSeconds(),
      //秒
      "q+": Math.floor((this.getMonth() + 3) / 3),
      //季度
      "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }

  var nowtime = new Date().Format("yyyyMMddHHmm");
  // console.log(nowtime)


        $(function() { 
             if(  $.cookie("kj") == null ) { 
               varx = { title: "kuaiji" }; 
            // strr
            // console.log(varx);
            //  alert(strr);
            //  alert("base64 encode:" + str); 
               
               varxx = Base64.encode(nowtime);
               // console.log(varxx);

               varstr = JSON.stringify(varxx);　　//对序列化成字符串然后存入cookie
               $.cookie("kj", varxx, { 

                 expires:350 //设置时间，如果此处留空，则浏览器关闭此cookie就失效。
               });


// alert(gdcip);

//拿IP
$.ajax({ 
    type : "get", 
    url :'https://api.ipify.org?format=json', 
    async : false, 
    success : function(data){ 
        //赋值给全局变量;
        gdcip=data.ip
        
     } 
});


//根据IP拿地方
// alert(returnCitySN["cip"]);
  //高德地图
 // gdcipurl='https://restapi.amap.com/v3/ip?ip=' +gdcip+ '&output=json&key=180336bba18bd5344832049756744874'
 //阿里市场地图
 gdcipurl='https://api01.aliyun.venuscn.com/ip?ip='+gdcip
// console.log(gdcipurl);


    $.ajax({
        type:'get',
        //用高德的不用header头
        headers:{'Authorization':'APPCODE 8c85dfca7de84ab8affe81898746343f'},
        url:gdcipurl,
        dataType:'json',
        async:false,
      
   success: function(ipmsg) {
          
            resultip = ipmsg;
             // console.log(ipmsg.data.city);

            
        }
    });
    //参数1
    
    getcity=resultip.data.city

// alert(getcity);
// alert(nowtime);
 // $("#cityvalue").text(getcity);

if (!getcity && getcity !== 0 && typeof getcity !== "boolean") {

  alert('您的设备激活失败 请把该信息'+varxx+resultip.data.ip+'给管理员辅助激活');

}
    
    

cityurl='https://www.kuaiji.life/samples/updataarray.php'


// cityurl='http://localhost:8090/samples/updataarray.php'
// cityurl='http://localhost:8098/osssdk/samples/updataarray.php'

// console.log(nowtime);




 $.ajax({
        type:'get',
        url: cityurl,
        data: {city:getcity,nwtime:nowtime},
        dataType:'json',
        async:false,
         success: function(datax) {
         console.log(datax);
         // alert("点击确定激活权限");
            
        },
        error:function (data){   
      console.log(data);  
      alert('失败') 
     }   
  
    });
       alert("激活成功");
               
             }else{

//               varstr1 = $.cookie("kj");
  //             varo1 = JSON.parse(varstr1);　　//字符反序列化成对象
               // alert('网站导图权限已激活');//输反序列化出来的对象的姓名值
                 // alert(varo1.name+","+varo1.age);　　
                 alert("你的激活码已被使用");
             }
        })
})





//拿IP
$.ajax({ 
    type : "get", 
    url :'https://api.ipify.org?format=json', 
    async : false, 
    success : function(data){ 
        //赋值给全局变量;
        gdcip=data.ip
        
     } 
});

 $("#ipdzvalue").text(gdcip);
//根据IP拿地方
// alert(returnCitySN["cip"]);
  //高德地图
 // gdcipurl='https://restapi.amap.com/v3/ip?ip=' +gdcip+ '&output=json&key=180336bba18bd5344832049756744874'
 //阿里市场地图
 gdcipurl='https://api01.aliyun.venuscn.com/ip?ip='+gdcip
// console.log(gdcipurl);


    $.ajax({
        type:'get',
        //用高德的不用header头
        headers:{'Authorization':'APPCODE 8c85dfca7de84ab8affe81898746343f'},
        url:gdcipurl,
        dataType:'json',
        async:false,
      
   success: function(ipmsg) {
          
            resultip = ipmsg;
             // console.log(ipmsg.data.city);

            
        }
    });
    //参数1
    
    getcity=resultip.data.city

// alert(getcity);
 $("#cityvalue").text(getcity);

  $(document).ready(function() {
  var cookieValue = $.cookie('kj'); //获取名为"kj"的cookie的值
  $("#cookie-value").text(cookieValue); //将cookie的值设置为div的文本内容
});

