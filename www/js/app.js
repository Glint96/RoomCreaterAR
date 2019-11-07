      //ニフクラのAPIキー取得
      var ncmb = new NCMB("1085a2f8c86913e271d923be516498582630414e5bf7e97762dc1bd0c085b4a6","d44b65294677fbe4133227ba59ce3014ad1425314fd9e7221ad31a5263e5465a");

      //ニフクラのsnsData取得
      var SNSData = ncmb.DataStore("SNSData");
      
      //画面遷移処理一覧
       window.fn = {};

        window.fn.toggleMenu = function () {
          document.getElementById('appSplitter').left.toggle();
        };

        window.fn.loadView = function (index) {
          document.getElementById('appTabbar').setActiveTab(index);
          document.getElementById('sidemenu').close();
        };

        window.fn.loadLink = function (url) {
          window.open(url, '_blank');
        };

        window.fn.pushPage = function (page) {
           document.getElementById('appNavigator').pushPage(page);
        };
        
        //mailsoushin.htmlからlogin.htmlに戻る画面遷移をバックボタン対応にしたい
        /* document.addEventListener('destroy',function(e){
          if(e.target.matches('#soushin')){
            //console.log(document.getElementById("appNavigator").topPage);
            var page = document.getElementById("appNavigator");
            var pages = page.pages;
            //console.log(pages);
            pages[pages.length-2].remove();
          }
        });*/

         //端末の準備ができたら呼び出し
  document.addEventListener("deviceready", onDiviceReady, false);
  function onDiviceReady(){
    //ログアウトしなかった時の次回自動ログイン処理
    var currentUser = ncmb.User.getCurrentUser();
            if (currentUser){
        //    alert(JSON.stringify(currentUser));
                ncmb.User.fetch()
                    //ログイン成功
                    .then(function(results){
                        console.log("currentUserName is " + currentUser.get("userName"));
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
        document.getElementById("ind_acount_name").innerHTML = currentUser.get("userName");
        //ニフクラのsnsData取得
        var SNSData = ncmb.DataStore("SNSData");
        //投稿数取得
        SNSData
        .equalTo("userName",currentUser.get("userName"))
        .count()
        .fetchAll()
        .then(function(res){ 
          var countpost = res.count + "post";
          document.getElementById("ind_acount_post").innerHTML = countpost;
        },function(err){
          console.log(err);
        });
      }   

          //ハートを押した時の処理
      var like = function(num) {
        if (document.getElementById("button-post-like-"+num).classList.contains("like")) {
          document.getElementById("button-post-like-"+num).classList.remove("md-favorite","like");
          document.getElementById("button-post-like-"+num).classList.add("md-favorite-outline");
        } else {
          document.getElementById("button-post-like-"+num).classList.remove("md-favorite-outline");
          document.getElementById("button-post-like-"+num).classList.add("md-favorite","like");
          //document.getElementById("post-like-"+num).style.opacity = 1;

            //ハートを押したときに一定時間大きなハートを出す処理 未使用
          /*setTimeout(function(){
            document.getElementById("post-like-"+num).style.opacity = 0;
          }, 600);*/
        }
      }

