  //APIリクエストの回数が1回で30近く有るのでどうにかして節約したい

  var post          //投稿数
  var sns_res       //sessionStorageに配列データを保存
  var sns_post      //snshyouji.htmlに渡す数
  var sns_num       //SNSのpopverの動作管理番号

      //ページ読込時に実行
  document.addEventListener('init',function(e){
      if(e.target.matches('#snsitiran')){
        snsCount();
      }
  });

  //投稿数取得処理
  function snsCount(){
        //投稿数取得
        SNSData
        .count()
        .fetchAll()
        .then(function(res){ 
            post = res.count;
            //投稿箇所のID取得
            var snsList = document.getElementById('ind_sns-list');
            console.log("投稿数"+post+"件");
            //配列データと作成する位置のid引き渡し
            snsMake(res,snsList,"sns");
        },function(err){
          console.log(err);
        });
    }    

//SNSの動的作成
function snsMake(res,snsList,page){
  snsList.delegate = {
      createItemContent: function(i) {
        //投稿物を取得
        sns_res = res;
        var object = res[res.length-(i+1)];
  
        var userName  = object.get("userName");
        var Date      = object.get("createDate");
        var text      = object.get("text");

        var reader = new FileReader();

        //写真が配列に保存してあるか判断
        var flg = false;
        for(var u=picture_name.length-1; 0<=u; u--){
          console.log(u);
         if(res[res.length-(u+1)].picture===object.picture){
            flg = true;
          }
        }
        //無いならデータダウンロード
        if(!flg){
          downloadImage(object.picture,reader);
        }
          //画像を表示
         reader.onload = function(e) {
            var dataUrl = reader.result;
            getPicture(dataUrl,object.picture);
            if(page === "sns")document.getElementById("ind_img"+i).src = picture[object.picture];  
            else if(page === "mysns")document.getElementById("my_img"+i).src = picture[object.picture];
         }

        if(page === "sns"){
          //SNSの型
          //    \（円）マークで改行
        return ons.createElement('<ons-card class="post">\
                                    <div id="ind_obj'+i+'" class="obj_post">'+object.get("objectId")+'</div>\
                                    <ons-list-item>\
                                      <div class="left">\
                                          <img class="list-item__thumbnail" src="photo/sofa.png" >\
                                        </div>\
                                        <div class="center">\
                                          <div class="list-item__title"><b>'+userName+'</b></div>\
                                          <div class="my_post-time">'+Date+'</div>\
                                      </div>\
                                      <div class="right">\
                                        <span class="corner-button" modifier="quiet" onclick="showPopover(this,'+i+')">\
                                          <ons-icon icon="md-more-vert"></ons-icon>\
                                        </span>\
                                      </div>\
                                    </ons-list-item>\
                                    <div style="text-align: center; position: relative;">\
                                      <img class="post-image" id="ind_img'+i+'" src="photo/cameraIcon.png" onclick="gosnshyouji('+i+')">\
                                    </div>\
                                    <ons-list-item class="post-button-bar" modifier="nodivider">\
                                      <div class="center" style="padding-top: 0px">\
                                      </div>\
                                      <div class="right corner-button bookmark">\
                                        <ons-button class="post-button" modifier="quiet" onclick="like('+ i +')"><ons-icon icon="md-favorite-outline" id="button-post-like-'+ i +'" ></ons-icon></ons-button>\
                                      </div>\
                                    </ons-list-item>\
                                    <div class="post-like-info"><b></b> </div>\
                                    <div class="post-caption"> '+ text +' </div>\
                                  </ons-card>');
        }else if(page === "mysns"){
          return ons.createElement('<ons-card class="post">\
                                    <div id="my_obj'+i+'" class="obj_post">'+object.get("objectId")+'</div>\
                                    <ons-list-item>\
                                      <div class="left">\
                                          <img class="list-item__thumbnail" src="photo/sofa.png" >\
                                        </div>\
                                        <div class="center">\
                                          <div class="list-item__title"><b>'+userName+'</b></div>\
                                          <div class="my_post-time">'+Date+'</div>\
                                      </div>\
                                      <div class="right">\
                                        <span class="corner-button" modifier="quiet" onclick="showPopover(this,'+i+')">\
                                          <ons-icon icon="md-more-vert"></ons-icon>\
                                        </span>\
                                      </div>\
                                    </ons-list-item>\
                                    <div style="text-align: center; position: relative;">\
                                      <img class="post-image" id="my_img'+i+'" src=""  onclick="gosnshyouji('+i+')">\
                                    </div>\
                                    <ons-list-item class="post-button-bar" modifier="nodivider">\
                                      <div class="center" style="padding-top: 0px">\
                                      </div>\
                                      <div class="right corner-button bookmark">\
                                        <ons-button class="post-button" modifier="quiet" onclick="like('+ i +')"><ons-icon icon="md-favorite-outline" id="button-post-like-'+ i +'" ></ons-icon></ons-button>\
                                      </div>\
                                    </ons-list-item>\
                                    <div class="post-like-info"><b></b> </div>\
                                    <div class="post-caption"> '+ text +' </div>\
                                  </ons-card>');
        }
      },
      countItems: function() {
        //表示件数を10件に制限
        if(post >= 10&&page==="sns"){
          post = 10;
        }
        //投稿数分作る
        return post;
      }
  };
  //snsList.refresh();
}

  function downloadImage(picture,reader){
    
      // ファイル名からファイルを取得
      var fileName = picture;

      // ダウンロード（データ形式をblobを指定）
      ncmb.File.download(fileName, "blob")
          .then(function(blob) {
          // ファイルリーダーにデータを渡す
          reader.readAsDataURL(blob);
          })
          .catch(function(err) {
              console.error(err);
          })
    }

    //snsの右上のポップアップメニュー表示切替
    var showPopover = function(target,num) {
      sns_num = num;
      document
        .getElementById('popover')
        .show(target,num);
    };

    var hidePopover = function() {
      document
        .getElementById('popover')
        .hide();
    };

     function gosnshyouji(i){
        // sessionStorage にデータを保存する
        sessionStorage.setItem('sns_hyouji', JSON.stringify(sns_res[sns_res.length-(i+1)]));
        console.log(JSON.stringify(sns_res[sns_res.length-(i+1)]))
        sns_post = i;
        fn.pushPage('snshyouji.html');
    }