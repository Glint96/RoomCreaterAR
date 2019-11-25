      //ニフクラのAPIキー取得
      var ncmb = new NCMB("1085a2f8c86913e271d923be516498582630414e5bf7e97762dc1bd0c085b4a6","d44b65294677fbe4133227ba59ce3014ad1425314fd9e7221ad31a5263e5465a");

      //ニフクラのsnsData取得
      var SNSData = ncmb.DataStore("SNSData");

      //ニフクラのアカウントのアイコンとお気に入り投稿データ取得
      var acountData = ncmb.DataStore("acountData");
      
      //ログイン状態の判断フラグ
      var login_f = false;
      
      //画面遷移処理一覧
      window.fn = {};
      //サイドメニューの表示方向処理
      window.fn.toggleMenu = function () {
        document.getElementById('appSplitter').left.toggle();
      };

      //サイドメニューの閉じる処理？
      window.fn.loadView = function (index) {
        document.getElementById('appTabbar').setActiveTab(index);
        document.getElementById('sidemenu').close();
      };

      //不明　未使用
      window.fn.loadLink = function (url) {
        window.open(url, '_blank');
      };

      //ページ遷移
      window.fn.pushPage = function (page) {
          document.getElementById('appNavigator').pushPage(page);
      };

      //ページスタックリセット処理
      window.fn.resetToPage = function (page) {
        document.getElementById('appNavigator').resetToPage(page);
      };

      //ページ置き換え
      window.fn.replacePage = function (page) {
        document.getElementById('appNavigator').replacePage(page);
      };

      // ぺージを一番上までスクロールする処理
      // 未動作
      function pageUp(){
        document.getElementById('snsitiran').scrollTo(0,0);
      }

         //端末の準備ができたら呼び出し
      document.addEventListener("deviceready", onDiviceReady, false);
      function onDiviceReady(){
        //ログアウトしなかった時の次回自動ログイン処理
        var currentUser = ncmb.User.getCurrentUser();
              // ログアウトしていないなら
                if (currentUser){
            //    alert(JSON.stringify(currentUser));
                    ncmb.User.fetch()
                        //ログイン成功
                        .then(function(results){
                            console.log("currentUserName is " + currentUser.userName);
                            //index.htmlのサイドメニューの文字切り替え
                            document.getElementById("login_button").innerHTML = "ログアウト";
                            login_f = true;
                            //acount呼び出し
                            acount();
                        })
                        //ログイン失敗
                        .catch(function(err){
                            ncmb.User.logout();
                        });

                } else {
                    //未ログインの場合
                }

          }     

      function acount(){
        currentUser = ncmb.User.getCurrentUser();
        //index.htmlとmypage.htmlのアカウント名を使用ユーザに書き換え
        document.getElementById("ind_acount_name").innerHTML = currentUser.userName;
        document.getElementById("ind_acount_Icon").style.visibility = "visible";
        //ニフクラのsnsData取得
        var SNSData = ncmb.DataStore("SNSData");
        //投稿数取得
        SNSData
        .equalTo("userName",currentUser.userName)
        .count()
        .fetchAll()
        .then(function(res){ 
          var countpost = res.count + "post";
          document.getElementById("ind_acount_post").innerHTML = countpost;

          acountData
          .equalTo("username",currentUser.username)
          .fetch()
          .then(function(res){
            //console.log(JSON.stringify(res));
            //アイコンが設定されてなければデフォルトアイコン表示
            if(res.userIcon === "defaultIcon.png"){
              document.getElementById("ind_acount_Icon").src = "photo/defaultIcon.png"
            }else{
              var reader = new FileReader();
              downloadImage(res[0].userIcon,reader);
              //画像を表示
              reader.onload = function(e) {
                  var dataUrl = reader.result;
                  getPicture(dataUrl,res[0].userIcon);
                  document.getElementById("ind_acount_Icon").src;
              }
            }
          });
        },function(err){
          console.log(err);
        });
      }   

  // ダイアログ表示
  var showDialog = function(edit) {
    //console.log(edit);
    switch(edit){
      case "name":
        var dialog = document.getElementById('name-dialog');
        if (dialog) {
          dialog.show();
        } else {
          ons.createElement('name-dialog.html', { append: true })
            .then(function(dialog) {
              dialog.show();
            });
        }
        break;
      case "unsub":
        var dialog = document.getElementById('unsub-dialog');
        if (dialog) {
          dialog.show();
        } else {
          ons.createElement('unsub-dialog.html', { append: true })
            .then(function(dialog) {
              dialog.show();
            });
        }
        break;
    case "mail":
        var dialog = document.getElementById('mail-dialog');
        if (dialog) {
          dialog.show();
        } else {
          ons.createElement('mail-dialog.html', { append: true })
            .then(function(dialog) {
              dialog.show();
            });
        }
        break;
    }
  };

  // ダイアログ非表示
  var hideDialog = function(id) {
    //console.log(id);
    document
      .getElementById(id + "-dialog")
      .hide();
  };

    
   var showpop_f = false; //ポップバー管理フラグ
    // ポップバー表示処理
    var showPopover = function(target,num,page) {
      //  編集や削除処理のために数字引き渡し
      sns_num = num;
      // ポップバーが表示されていなければ表示
      // されていれば非表示
      if(!showpop_f){
      document
        .getElementById('popover'+page)
        .show(target,num);
        showpop_f = true;
      }else{
        hidePopover();
      }
    };
    
    // ポップバー非表示処理
    var hidePopover = function() {
      document
        .getElementById('popover1')
        .hide();
      document
        .getElementById('popover2')
        .hide();

      showpop_f = false;
    };

    // popoverにつけたcacelable属性で閉じた時用
    // （hidepopover()を使わずに閉じた時）
    document.addEventListener("prehide",function(e){
      //console.log(e.target.id);
      if(e.target.id === ("popover1")||e.target.id ===("popover2")){
        showpop_f = false;
      }
    });