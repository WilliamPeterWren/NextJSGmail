export const getMimeType = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
    case 'jfif':
    case 'webp':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
};

export const defaultImage = (item) => {
  const extension = item?.filename.split('.').pop().toLowerCase();

  switch (extension) {
    case 'txt':
      return '../../assets/icons/txt.webp'
    case 'pdf':
      return '../../../assets/icons/pdf_file.png'
    case 'doc': case 'docx':
      return '../../assets/icons/doc_file.png'
    case 'xls': case 'xlsx':
      return '../../assets/icons/excel.png'

    default:
      return '../../assets/icons/default-download2.png'
  }
}