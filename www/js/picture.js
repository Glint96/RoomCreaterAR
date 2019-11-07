//SNSの写真保存用JS

const picture = {};    //写真の保存用配列
const picture_name = {};
var picture_count = 0;

function getPicture(dataUrl,pictureName){
  picture[pictureName] = dataUrl;
  picture_name[pictureName] = pictureName;
  picture_count++;
}