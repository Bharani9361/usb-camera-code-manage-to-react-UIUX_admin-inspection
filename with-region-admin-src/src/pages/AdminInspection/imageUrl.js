// import { useEffect, useState } from 'react';

// export const useImageUrl = () => {
//     const [imgUrl, setImgUrl] = useState(() => {
//         const data = JSON.parse(localStorage.getItem('db_info'));
//         return data?.db_name
//             ? `https://d16qxmwlgqc3es.cloudfront.net/Vs_inspection/${data.db_name}/`
//             : null;
//     });

//     useEffect(() => {
//         const updateUrl = () => {
//             const data = JSON.parse(localStorage.getItem('db_info'));
//             if (data?.db_name) {
//                 const newUrl = `https://d16qxmwlgqc3es.cloudfront.net/Vs_inspection/${data.db_name}/`;
//                 setImgUrl(newUrl);
//             }
//         };

//         window.addEventListener('db_info_set', updateUrl);
//         return () => window.removeEventListener('db_info_set', updateUrl);
//     }, []);

//     return imgUrl;
// }


// // // imageUrl.js
// // const imageUrl = {
// //     get value() {
// //         const data = JSON.parse(localStorage.getItem('db_info'));
// //         if (data) {
// //             return `https://d16qxmwlgqc3es.cloudfront.net/Vs_inspection/${data.db_name}/`;
// //         }
// //         return null;
// //     }
// // };

// // export default imageUrl;



// var img_url = 'https://incidentum.com:9092/'
// var img_url = 'https://localhost:8054/'
let data = JSON.parse(localStorage.getItem('db_info'));
var image_url = `https://d16qxmwlgqc3es.cloudfront.net/Vs_inspection/`;
var remote_img_url = "https://localhost:8054/"

// var img_url = 'https://172.16.1.197:8053/'

// module.exports = img_url    
module.exports = { image_url, remote_img_url }    
