import {
  mdiFileImage,
  mdiFileWord,
  mdiFileTable,
  mdiFilePowerpoint,
  mdiFileMusic,
  mdiFileVideo,
  mdiFileCode,
  mdiFolderZip,
  mdiFileCad,
  mdiFileKey,
  mdiFileDocument,
} from '@mdi/js'

const iconNameToPath: { [key: string]: string } = {
  mdiFileImage: mdiFileImage,
  mdiFileWorld: mdiFileWord,
  mdiFileTable: mdiFileTable,
  mdiFilePowerpoint: mdiFilePowerpoint,
  mdiFileMusic: mdiFileMusic,
  mdiFileVideo: mdiFileVideo,
  mdiFileCode: mdiFileCode,
  mdiFolderZip: mdiFolderZip,
  mdiFileCad: mdiFileCad,
  mdiFileKey: mdiFileKey,
}

export function isLinkMessage(text: string): boolean {
  return !!urlPattern.test(text)
}

export function isImageType(name: string): boolean {
  return imageFormats.some(format => name.toLowerCase().endsWith(format))
}

export function isVideoType(name: string): boolean {
  return videoFormats.some(format => name.toLowerCase().endsWith(format))
}

export function decideFileType(name: string): string {
  const fileName = name.toLowerCase()
  for (const [icon, formats] of Object.entries(fileTypeMap)) {
    if (formats.some(format => fileName.endsWith(format))) {
      return iconNameToPath[icon as keyof typeof iconNameToPath]
    }
  }

  return mdiFileDocument
}

const urlPattern = new RegExp(
  '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
  'i', // fragment locator
)

const imageFormats = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.bmp',
  '.webp',
  '.svg',
  '.ico',
  '.tiff',
  '.tif',
  '.heic',
  '.raw',
]

const videoFormats = [
  '.mp4',
  '.mkv',
  '.avi',
  '.mov',
  '.wmv',
  '.flv',
  '.webm',
  '.mpeg',
  '.mpg',
  '.m4v',
  '.3gp',
  '.3g2',
]

const fileTypeMap: { [key: string]: string[] } = {
  mdiFileImage: imageFormats,
  mdiFileWorld: ['.doc', '.docx', '.odt', '.rtf', '.txt', '.wps', '.wpd'],
  mdiFileTable: ['.xls', '.xlsx', '.ods', '.csv', '.tsv', '.xlsm', '.xlsb'],
  mdiFilePowerpoint: [
    '.ppt',
    '.pptx',
    '.odp',
    '.pps',
    '.ppsx',
    '.pot',
    '.potx',
  ],
  mdiFileMusic: [
    '.mp3',
    '.wav',
    '.flac',
    '.ogg',
    '.aac',
    '.wma',
    '.m4a',
    '.aiff',
    '.alac',
  ],
  mdiFileVideo: videoFormats,
  mdiFileCode: [
    '.html',
    '.css',
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.json',
    '.xml',
    '.yaml',
    '.yml',
    '.md',
    '.markdown',
    '.cpp',
    '.c',
    '.h',
    '.hpp',
    '.java',
    '.py',
    '.rb',
    '.php',
    '.sql',
    '.sh',
    '.bat',
    '.ps1',
    '.psm1',
    '.psd1',
    '.ps1xml',
    '.pssc',
    '.psc1',
    '.pssc',
    '.pl',
    '.perl',
    '.go',
    '.rs',
    '.swift',
    '.kt',
    '.kts',
    '.clj',
    '.cljs',
    '.scala',
    '.groovy',
    '.gradle',
    '.dockerfile',
    '.properties',
    '.ini',
    '.cfg',
    '.conf',
    '.toml',
    '.yaml',
    '.yml',
    '.json',
    '.xml',
    '.csv',
    '.tsv',
    '.log',
    '.r',
    '.sas',
    '.stata',
    '.do',
    '.m',
    '.mat',
    '.rmd',
    '.ipynb',
  ],
  mdiFolderZip: [
    '.zip',
    '.rar',
    '.7z',
    '.tar',
    '.gz',
    '.bz2',
    '.xz',
    '.lz',
    '.lzma',
    '.lzo',
    '.zst',
    '.z',
    '.tar.gz',
    '.tgz',
    '.tar.bz2',
    '.tbz2',
    '.tar.xz',
    '.txz',
    '.tar.lz',
    '.tlz',
    '.tar.lzma',
    '.tar.lzo',
    '.tar.zst',
    '.tzst',
  ],
  mdiFileCad: [
    '.dwg',
    '.dxf',
    '.dgn',
    '.stl',
    '.obj',
    '.fbx',
    '.3ds',
    '.skp',
    '.step',
    '.stp',
    '.igs',
    '.iges',
    '.x_t',
    '.x_b',
    '.sat',
    '.sab',
    '.3dm',
    '.prt',
    '.asm',
    '.xas',
    '.xpr',
  ],
  mdiFileKey: [
    '.key',
    '.pem',
    '.pub',
    '.asc',
    '.gpg',
    '.pgp',
    '.p12',
    '.pfx',
    '.cer',
    '.crt',
    '.der',
    '.keychain',
    '.jks',
    '.keystore',
    '.bks',
    '.pkcs12',
    '.p7b',
    '.p7c',
    '.p7r',
    '.p7s',
    '.p8',
  ],
}
