export default function (date) {
    if(!date){
        return;
    }
    let month = date.getMonth() + 1;
    month = month < 10 ? ('0' + month) : month;
    let day = date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate();
    let dateStr = date.getFullYear() + '-' + month  + '-' + day;
    return dateStr;
}