  //APIリクエストの回数が1回で30近く有るのでどうにかして節約したい

  var post;          //投稿数
  var sns_res;       //sessionStorageに配列データを保存
  var sns_post;      //snshyouji.htmlに渡す数
  var sns_num;       //SNSのpopverの動作管理番号
  var likeItem;      //お気に入り処理の配列を入れる
  var sns_page;      //ページ管理

  var destroy_f = false; //マイページの削除機能管理

  //ページ読込時に実行
  document.addEventListener('init',function(e){
      if(e.target.matches('#snsitiran')){
        snsCount();
      }
  });

  //ページ表示時に実行
  document.addEventListener('show',function(e){
      if(e.target.matches('#snsitiran')){
        sns_page = "sns";
      }else if(e.target.matches('#profile-page')){
        sns_page = "likesns";
      }
  });

  // マイページを閉じた＆投稿を削除した場合、更新する
  //destroy_fはAPIリクエスト削減のため使用
  document.addEventListener("destroy",function(e){
      if(e.target.matches('#profile-page')&&destroy_f){
        // 現在表示されている投稿を削除
        document.getElementById('ind_sns-list').refresh();
        snsCount();
        destroy_f = false;
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

            if(login_f){
              // ユーザーのお気に入り情報獲得
              var currentUser = ncmb.User.getCurrentUser();
              acountData
              .equalTo("userName",currentUser.userName)
              .fetch()
              .then(function(res_sns){
                likeItem = res_sns.likeSns;
                // console.log(res_sns.likeSns);
                // console.log(likeItem.length);
                //アカウントテーブルからお気に入り処理したデータを入れた配列を取得してから引き渡し
                //取得してからじゃないとundefinedになり正しく動作しない
                snsMake(res,snsList,"sns");
              });
            }else{
              // 配列データと作成する位置のid引き渡し
              snsMake(res,snsList,"sns");
            }

            
        },function(err){
          console.log(err);
        });
    }    

//SNSの動的作成
function snsMake(res,snsList,page){
  snsList.delegate = {
      createItemContent: function(i) {
        sns_res = res;  //投稿表示用に取得
        var object = res[res.length-(i+1)];  //SNSDataのデータ配列

        /*
        var userName  = object.get("userName");   //ユーザーネーム
        var Date      = object.get("createDate"); //投稿日
        var text      = object.get("text");       //テキスト
        */
        
        //日付の文字列を切り出して表示
        var str = object.createDate;
        var date = str.substring(0,10);
        var hour = parseInt(str.substring(11,13),10) + 9;
        var min = str.substring(14,16);
        var creDate = date +" "+ hour +":"+ min;
        
        var reader = new FileReader();

        //写真が配列に保存してあるか判断
        var flg = false;
        for(var u=picture_name.length-1; 0<=u; u--){
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
            else if(page === "likesns")document.getElementById("like_img"+i).src = picture[object.picture];
         }

        if(page === "sns"){
          // お気に入り処理してある投稿にlike（css）付与
          var like_f = false;
          if(login_f){
            var objId = object.get("objectId");
            for(var u=likeItem.length-1; 0<=u; u--){
              if(likeItem[u] === objId){
                like_f = true;
                break;
              }
            }
          }
          //SNSの型
          //    \（円）マークで改行
          if(!like_f){
          return ons.createElement('<ons-card class="post">\
                                      <div id="ind_obj'+i+'" class="obj_post">'+object.get("objectId")+'</div>\
                                      <ons-list-item>\
                                        <div class="left">\
                                            <img class="list-item__thumbnail" src="photo/defaultIcon.png">\
                                          </div>\
                                          <div class="center">\
                                            <div class="list-item__title"><b>'+object.get("userName")+'</b></div>\
                                            <div class="my_post-time">'+creDate+'</div>\
                                        </div>\
                                        <div class="right">\
                                          <span class="corner-button" modifier="quiet" onclick="showPopover(this,'+i+','+1+')">\
                                            <ons-icon icon="md-more-vert"></ons-icon>\
                                          </span>\
                                        </div>\
                                      </ons-list-item>\
                                      <div style="text-align: center; position: relative;">\
                                        <img class="post-image" id="ind_img'+i+'" src="photo/cameraIcon.png" onclick="gosnshyouji('+i+')">\
                                      </div>\
                                      <ons-list-item class="post-button-bar" modifier="nodivider">\
                                        <div class="center" style="padding-top: 0px" onclick="gosnshyouji('+i+')">\
                                          <div class="post-caption" style="overflow:hidden;height:30px"> '+ object.get("text") +'\
                                        </div>\
                                        </div>\
                                        <div class="right corner-button bookmark">\
                                          <ons-button class="post-button" modifier="quiet" onclick="like('+ i +')"><ons-icon icon="md-favorite-outline" id="button-post-like-'+ i +'" ></ons-icon></ons-button>\
                                        </div>\
                                      </ons-list-item>\
                                    </ons-card>');
          }else{
            return ons.createElement('<ons-card class="post">\
                                      <div id="ind_obj'+i+'" class="obj_post">'+object.get("objectId")+'</div>\
                                      <ons-list-item>\
                                        <div class="left">\
                                            <img class="list-item__thumbnail" src="photo/defaultIcon.png">\
                                          </div>\
                                          <div class="center">\
                                            <div class="list-item__title"><b>'+object.get("userName")+'</b></div>\
                                            <div class="my_post-time">'+creDate+'</div>\
                                        </div>\
                                        <div class="right">\
                                          <span class="corner-button" modifier="quiet" onclick="showPopover(this,'+i+','+1+')">\
                                            <ons-icon icon="md-more-vert"></ons-icon>\
                                          </span>\
                                        </div>\
                                      </ons-list-item>\
                                      <div style="text-align: center; position: relative;">\
                                        <img class="post-image" id="ind_img'+i+'" src="photo/cameraIcon.png" onclick="gosnshyouji('+i+')">\
                                      </div>\
                                      <ons-list-item class="post-button-bar" modifier="nodivider">\
                                        <div class="center" style="padding-top: 0px" onclick="gosnshyouji('+i+')">\
                                          <div class="post-caption" style="overflow:hidden;height:30px"> '+ object.get("text") +'\
                                        </div>\
                                        </div>\
                                        <div class="right corner-button bookmark">\
                                          <ons-button class="post-button" modifier="quiet" onclick="like('+ i +')"><ons-icon icon="md-favorite-outline" id="button-post-like-'+ i +'" class = "like"></ons-icon></ons-button>\
                                        </div>\
                                      </ons-list-item>\
                                    </ons-card>');
          }
        }else if(page === "mysns"){
          return ons.createElement('<ons-card class="post" style="margin-bottom:10px">\
                                    <div id="my_obj'+i+'" class="obj_post">'+object.get("objectId")+'</div>\
                                    <ons-list-item>\
                                      <div class="left">\
                                          <img class="list-item__thumbnail" src="photo/defaultIcon.png" >\
                                        </div>\
                                        <div class="center">\
                                          <div class="list-item__title"><b>'+object.get("userName")+'</b></div>\
                                          <div class="my_post-time">'+creDate+'</div>\
                                      </div>\
                                      <div class="right">\
                                        <span class="corner-button" modifier="quiet" onclick="showPopover(this,'+i+','+1+')">\
                                          <ons-icon icon="md-more-vert"></ons-icon>\
                                        </span>\
                                      </div>\
                                    </ons-list-item>\
                                    <div style="text-align: center; position: relative;">\
                                      <img class="post-image" id="my_img'+i+'" src="photo/cameraIcon.png"  onclick="gosnshyouji('+i+')">\
                                    </div>\
                                    <ons-list-item class="post-button-bar" modifier="nodivider">\
                                       <div class="center" style="padding-top: 0px" onclick="gosnshyouji('+i+')">\
                                        <div class="post-caption"> '+ object.get("text").substring(0,35) +'\
                                      </div>\
                                      <div class="center" style="opacity:0.5;position:absolute;margin-left:68%;margin-top:10px">\
                                        詳細>>\
                                      </div>\
                                      <div class="right corner-button bookmark">\
                                      </div>\
                                    </ons-list-item>\
                                  </ons-card>');
        }else if(page === "likesns"){
          return ons.createElement('<ons-card class="post">\
                                      <div id="like_obj'+i+'" class="obj_post">'+object.get("objectId")+'</div>\
                                      <ons-list-item>\
                                        <div class="left">\
                                            <img class="list-item__thumbnail" src="photo/defaultIcon.png">\
                                          </div>\
                                          <div class="center">\
                                            <div class="list-item__title"><b>'+object.get("userName")+'</b></div>\
                                            <div class="my_post-time">'+creDate+'</div>\
                                        </div>\
                                        <div class="right">\
                                        </div>\
                                      </ons-list-item>\
                                      <div style="text-align: center; position: relative;">\
                                        <img class="post-image" id="like_img'+i+'" src="photo/cameraIcon.png" onclick="gosnshyouji('+i+')">\
                                      </div>\
                                      <ons-list-item class="post-button-bar" modifier="nodivider">\
                                        <div class="center" style="padding-top: 0px" onclick="gosnshyouji('+i+')">\
                                          <div class="post-caption" style="overflow:hidden;height:30px"> '+ object.get("text") +'\
                                        </div>\
                                        </div>\
                                        <div class="right corner-button bookmark">\
                                          <ons-button class="post-button" modifier="quiet" onclick="like('+ i +')"><ons-icon icon="md-favorite-outline" id="like_button-post-like-'+ i +'" class = "like"></ons-icon></ons-button>\
                                        </div>\
                                      </ons-list-item>\
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
  snsList.refresh();
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

    //ハートを押した時の処理
    function like(num) {
      var like_f = true; //addlikeSns制御
      console.log(sns_page);
      if(sns_page === "sns"){
        if(login_f){
          // like(cssが付与)されているなら
          //ハートのデザイン変更がうまくいっていない
          if (document.getElementById("button-post-like-"+num).classList.contains("like")) {
            document.getElementById("button-post-like-"+num).classList.remove("md-favorite","like");
            document.getElementById("button-post-like-"+num).classList.add("md-favorite-outline");
            like_f = false;
          // いないなら
          } else {
            document.getElementById("button-post-like-"+num).classList.remove("md-favorite-outline");
            document.getElementById("button-post-like-"+num).classList.add("md-favorite","like");
            login_f = true;
            //document.getElementById("post-like-"+num).style.opacity = 1;

              //ハートを押したときに一定時間大きなハートを出す処理 未使用
            /*setTimeout(function(){
              document.getElementById("post-like-"+num).style.opacity = 0;
            }, 600);*/
          }
        }
      }else if(sns_page === "likesns"){
        if (document.getElementById("like_button-post-like-"+num).classList.contains("like")) {
            document.getElementById("like_button-post-like-"+num).classList.remove("md-favorite","like");
            document.getElementById("like_button-post-like-"+num).classList.add("md-favorite-outline");
            like_f = false;
          // いないなら
          } else {
            document.getElementById("like_button-post-like-"+num).classList.remove("md-favorite-outline");
            document.getElementById("like_button-post-like-"+num).classList.add("md-favorite","like");
            login_f = true;
        }
      }
      addLikeSns(like_f,num);
    }

    function addLikeSns(like_f,num){
      // ログイン中のユーザー情報獲得
      var currentUser = ncmb.User.getCurrentUser();

      acountData
      .equalTo("userName",currentUser.userName) // アカウントテーブルからユーザー名でデータ検索
      .fetch()
      .then(function(res){
        var objId;
        if(sns_page === "sns")objId = document.getElementById("ind_obj"+num).innerHTML;//投稿の中に隠してあるオブジェクトIDを取得
        else if(sns_page === "likesns")objId = document.getElementById("like_obj"+num).innerHTML;
        //console.log("before "+res.likeSns);
        console.log(objId);

        //お気に入りしていないなら配列に追加
        //しているなら削除
        if(like_f){
          res.likeSns.push(objId);
        }else{
          res.likeSns = res.likeSns.filter(res => res !== objId); //配列 + filter(変数名 検索条件 変数名 検索条件 検索対象);
        }
        //console.log("after "+res.likeSns);
        return res.update();　//ニフクラデータ更新　配列の場合 .set でデータをセットしなくていい
      });
    }

     function gosnshyouji(i){
        // sessionStorage にデータを保存する
        sessionStorage.setItem('sns_hyouji', JSON.stringify(sns_res[sns_res.length-(i+1)]));
        //console.log(JSON.stringify(sns_res[sns_res.length-(i+1)]))
        sns_post = i;
        fn.pushPage('snshyouji.html');
    }

     //マウスホイールの禁止はできているもののタッチ操作の禁止ができていない  
        // スクロール禁止
        function no_scroll() {
            // PCでのスクロール禁止
            document.addEventListener("mousewheel", scroll_control, { passive: false });
            // スマホでのタッチ操作でのスクロール禁止
            document.addEventListener("touchmove", scroll_control, { passive: false });
        }
        // スクロール禁止解除
        function return_scroll() {
            // PCでのスクロール禁止解除
            document.removeEventListener("mousewheel", scroll_control, { passive: false });
            // スマホでのタッチ操作でのスクロール禁止解除
            document.removeEventListener('touchmove', scroll_control, { passive: false });
        }
        // スクロール関連メソッド
        function scroll_control(event) {
          console.log(JSON.stringify(event));
            event.preventDefault();
        }

        // アイコン変更
        function changeIcon(){
          //ファイルの読み込み
          var reader = new FileReader();
            reader.onload = function(e) {
            var dataUrl = reader.result;
          }

          //ファイルを選択したら実行
          //ファイル読込処理
          var photo = document.getElementById("edit_acount_Icon");
          photo.addEventListener('change',function(e) {
            e.preventDefault();
            var file = e.target.files[0];
            reader.onload = function(e) {
              //プレビュー
              var icon = document.getElementById("edit_acount_Icon");
              icon.src = e.target.result;
            }
            //バイナリデータ読込
            reader.readAsDataURL(file);
          }, false);
          
          //ランダムな文字列生成
          // 生成する文字列の長さ
          var l = 8;

          // 生成する文字列に含める文字セット
          var c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

          var cl = c.length;
          for(var i=0; i<l; i++){
            code += c[Math.floor(Math.random()*cl)];
          }
          
          //ファイルの名前そのままで管理すると重複してSNS画面にて違うデータを表示する可能性有り
          //ランダムな文字列とファイル名で重複する確率を下げる
          var iconName = code + document.getElementById("edit_acount_Icon").files[0].name;
          var iconData = document.getElementById("edit_acount_Icon").files[0];
          


          acountData
          .equalTo("userName",currentUser.userName)
          .fetch
          .then(function(res){
            res.set("userIcon",iconName);
            return res.update();
          });
        }

        // 名前変更
        // うまく動かない
        // 403エラー
        // 会員管理のパーミッション変更でうごく？
        function nameEdit(){
          var name = document.getElementById("my_username").value;
          var currentUserName = currentUser.userName;
          
          document.getElementById("my_acount_name").innerHTML = name;
          //投稿に書かれているユーザー名を変更
          SNSData
          .equalTo("userName",currentUserName)
          .fetch()
          .then(function(res){
            
              res.set("userName",name);
              return res.update();
            
            //アカウントテーブルのユーザー名を変更
            acountData
            .equalTo("userName",currentUserName)
            .fetch()
            .then(function(res){
              res.set("userName",name)
              return res.update();

              // ユーザ名変更
              //最後に処理
              currentUser
              .set("userName", name)
              return currentUser.update(); // 保存したオブジェクトを更新
            });
          });
        }

        //退会処理アラート表示    
        function show_unsub(){
            var pass = document.getElementById("my_password").value;
            // console.log(currentUser.password);
            // console.log(pass);
            if(currentUser.password = pass){    
                //アラート表示
                var dialog = document.getElementById('my-alert-dialog');

                if (dialog) {
                  dialog.show();
                } else {
                  ons.createElement('alert-dialog.html', { append: true })
                    .then(function(dialog) {
                      dialog.show();
                    });
                }

            }else{
              alert("パスワードが間違っています");
            }
        }
        
        //退会処理
        function unsub(){
          // ユーザーの投稿を削除
            SNSData
            .equalTo("userName",currentUser.userName)
            .fetchAll()
            .then(function(res){
              for(var u = 0; u<res.length; u++){
                //画像を削除
                ncmb.File.delete(res.picture);
                //投稿を削除
                res[u].delete();
              }
            //アカウントのアイコンやお気に入り処理の配列を削除
            //アカウントを削除
            acountData
              .equalTo("userName",currentUser.userName)
              .fetch()
              .then(function(res_acount){
                //アカウントデータを削除
                res_acount.delete();
                //アカウントを削除
                currentUser.delete();
                alert("退会しました")
                //アラートを消す
                document
                .getElementById('my-alert-dialog')
                .hide();
                //ホーム画面に戻る（resetToPageを使いたいが、index.htmlをどう呼び出せば正しく動くのかわからないのでpopを2回している）
                document.getElementById('appNavigator').popPage();
                document.getElementById('appNavigator').popPage();
              });
            }).catch(function(err){
                console.log(err);
            });
            
        }
        //アラートを非表示
        function hideAlertDialog() {
          document
            .getElementById('my-alert-dialog')
            .hide();
        }