// import { getDirectory } from "./amazoncred";

// async function imageUploader(file: any, fileName: string) {
//     const S3Client = getDirectory();
//     return S3Client.uploadFile(file, fileName?.split(' ').join('-')).then(async (data: any) => {
//         const lastSlashIndex = data?.location?.lastIndexOf('/');
//         const fileName = encodeURIComponent(data?.location?.slice(lastSlashIndex + 1));
//         const baseUrl = data?.location.slice(0, lastSlashIndex);
//         const fileEncodedUrl = baseUrl + '/' + fileName;
//         console.log(fileEncodedUrl);
//         return fileEncodedUrl
//     }, (error: any) => {
       
//         console.log(error, 'this is error');
//     })
// }

// export default imageUploader ;