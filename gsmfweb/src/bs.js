//jsut

var cos_info = {
    appid : '1254107985',
    bucket_upload : 'gsmfupload',
    bucket_download : 'gsmfdownload',
    region : 'sh',
    myFolder : '/'
}
var sign_url_base = 'http://service-51w8qz2f-1254107985.ap-shanghai.apigateway.myqcloud.com/release/auth/'

function CosCloud_upload_init(){
    var tm = parseInt((new Date()).getTime()/1000)
    var cos_upload = new CosCloud({
                appid: cos_info.appid, 
                bucket: cos_info.bucket_upload,
                region: cos_info.region, 
                getAppSign: function (callback) {
                    // $.get('../../cos-php-sdk-v4/auth.php', {pathname: self.path}, callback)
                    var sign_url = sign_url_base + '?bucket=' + cos_info.bucket_upload +'&time=' +tm
                    $.ajax({
                    type:'GET',
                    url:sign_url,
                    dataType:'json',
                    success:function(data){
                    callback(data.sign)
                        }
                    })
                },
                getAppSignOnce: function (callback) {
                    // $.get('../../cos-php-sdk-v4/auth.php', {pathname: self.path}, callback)
                    var sign_url = sign_url_base + '?bucket=' + cos_info.bucket_upload +'&time=' +tm
                    $.ajax({
                    type:'GET',
                    url:sign_url,
                    dataType:'json',
                    success:function(data){
                    callback(data.sign)
                        }
                    })
                }
            })
        cos_upload.tm =  tm
        return cos_upload
            }

function CosCloud_download_init(){
    var tm = parseInt((new Date()).getTime()/1000)
    var cos_download = new CosCloud({
                appid: cos_info.appid, 
                bucket: cos_info.bucket_download,
                region: cos_info.region, 
                getAppSign: function (callback) {
                    // $.get('../../cos-php-sdk-v4/auth.php', {pathname: self.path}, callback)
                    var sign_url = sign_url_base + '?bucket=' + cos_info.bucket_download +'&time=' + tm
                    $.ajax({
                    type:'GET',
                    url:sign_url,
                    dataType:'json',
                    success:function(data){
                    callback(data.sign)
                        }
                    })
                },
                getAppSignOnce:  function (callback) {
                    // $.get('../../cos-php-sdk-v4/auth.php', {pathname: self.path}, callback)
                    var sign_url = sign_url_base + '?bucket=' + cos_info.bucket_download +'&time=' + tm
                    $.ajax({
                    type:'GET',
                    url:sign_url,
                    dataType:'json',
                    success:function(data){
                    callback(data.sign)
                        }
                    })
                }
            })
        cos_download.tm =  tm
        return cos_download
            }
            
var cos_upload = CosCloud_upload_init(),cos_download = CosCloud_download_init()
var tabletrs


var upload_successCallBack = function (result) {
    //上传成功回调
    ////console.log('request success.')
    ////console.log(JSON.stringify(result))
    $("#status_resutl").text('上传成功,后台处理中...')
    setTimeout((function(){
        $("#getUploadList").click()
    }),3000)
}

var errorCallBack = function (result) {
    result = result || {}
    //console.log('request error:', result && result.message)
    $("#status_resutl").text(result.responseText || 'error')
}

var progressCallBack = function (curr, sha1) {
    //上传进度回调
    //var sha1CheckProgress = ((sha1 * 100).toFixed(2) || 100) + '%'
    var uploadProgress = ((curr || 0) * 100).toFixed(2) + '%'
    var msg = ' 上传进度:' + uploadProgress + ".."
    ////console.log(msg)
    $("#status_resutl").text(msg)
}


var lastTaskId
var taskReady = function (taskId) {
    lastTaskId = taskId
}

$('#uploadFile').on('click', function () {
    $('#js-file').off('change').on('change', function (e) {
        //读取文件有个过程，先出现一个读取中提示
        $("#status_resutl").text("读取文件中...")
        var file = e.target.files[0]
        cos_upload.uploadFile(upload_successCallBack, errorCallBack, progressCallBack, cos_upload.bucket,  file.name, file, 0, taskReady) //insertOnly==0 表示允许覆盖文件 1表示不允许
        $('#form')[0].reset()
        return false
    })
    setTimeout(function () {
        $('#js-file').click()
    }, 0)
    return false
})


var view_file_list = []
var getUploadList_successCallBack = function (result) {
    //获取上传库文件列表成功回调
    //console.log('request success.')
    //console.log(JSON.stringify(result))
    view_file_list = []
    //upload_list_json = result
    if (result.data.infos){
    for (var i in  result.data.infos){
        var data = result.data.infos[i]
        view_file_list.push({src_url:data.source_url,
            src_name:data.name,
            src_time:data.mtime,
            src_filesize:data.filesize?(data.filesize/(1024*1024)).toFixed(2) + 'M':'',
            src_type:data.filesize?"File":"Folder"
            })
        }
    //获取下载库文件列表
    cos_download.getFolderList(getDownloadList_successCallBack, errorCallBack, cos_download.bucket, '/',50, '', 1)
    }
} 


var getDownloadList_successCallBack = function (result) {
    //获取下载库文件列表成功回调
    //console.log('request success.')
    //console.log(JSON.stringify(result.data.infos))
    if (result.data.infos){
        for (var i in  result.data.infos){
        var data = result.data.infos[i]
        for (var x in view_file_list){
            ////console.log(data.name.substr(0,data.name.lastIndexOf('_')))
            if (view_file_list[x].src_name.substr(0,view_file_list[x].src_name.lastIndexOf('.')) === data.name.substr(0,data.name.lastIndexOf('_'))){
                view_file_list[x].lst_name = data.name
                view_file_list[x].lst_url = data.source_url
            }
        }
        }
    }
    
    tabletrs.splice(0,tabletrs.length)
    view_file_list.sort(function(a,b){
        //加载前根据修改时间排序
        return b.src_time - a.src_time
    })
    for (var y of view_file_list){
    y.src_time = converTimestamp(y.src_time)
    y.del_file = function (e,model){
        //删除按钮事件
        //console.log(model)
        var up_file_name = model.tabletrs.src_name
        var down_file_name = model.tabletrs.lst_name
        del_cos_file(up_file_name,down_file_name)
    }
    tabletrs.push(y)
    }
    $("#status_resutl").text("就绪")
    if (view_file_list.length == 0){
        $("#loading td").text('没有数据')
        $("#loading").show()
    }else{
        $("#loading").hide()
    }
}

function del_cos_file(up_file_name,down_file_name){
        $("#status_resutl").text("正在删除")
        var del_upfile_flag = 0,del_downfile_flag = 0
        cos_upload.deleteFile(del_upfile_successCallBack, errorCallBack, cos_upload.bucket, up_file_name)

        if (down_file_name){
            cos_download.deleteFile(del_downfile_successCallBack, errorCallBack, cos_download.bucket, down_file_name)
        }else{
            del_downfile_flag = 1
        }

        function del_upfile_successCallBack(){
            del_upfile_flag = 1
            //console.log(del_upfile_flag,del_downfile_flag)
            if(del_downfile_flag==1){
                $("#getUploadList").click()
                $("#status_resutl").text("就绪")
            }
        }
        function del_downfile_successCallBack(){
            del_downfile_flag = 1
            //console.log(del_upfile_flag,del_downfile_flag)
            if(del_downfile_flag==1){
                $("#getUploadList").click()
                $("#status_resutl").text("就绪")
            }
    }
}

$('#getUploadList').on('click', function () {
    //获取上传库文件列表
    $("#status_resutl").text("刷新中.....")
    cos_upload.getFolderList(getUploadList_successCallBack, errorCallBack, cos_upload.bucket, cos_upload.myFolder,50, '', 1)
})




function converTimestamp(timestamp) {
    //将timestamp转为日期 1990-11-11 11:11:11格式
    var day = "",
        month = "",
        hours = "",
        minutes = "",d;
    d = new Date(parseInt(timestamp)*1000)
    if (typeof(timestamp) == "undefined"){
        d = new Date()
    }

    day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
    month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth()+1) : (d.getMonth()+1);
    hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
    minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
    seconds = d.getSeconds() <10 ? '0' + d.getSeconds() : d.getSeconds();
    var date = (d.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds);
    return date
}