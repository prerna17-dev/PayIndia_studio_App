const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

const paths = [
    "src\\uploads\\certificates\\income\\file-123.png",
    "E:\\WorknAI\\PayIndiastudio_App\\Recharge_backend\\src\\uploads\\certificates\\income\\file-123.png",
    "/home/user/app/src/uploads/certificates/income/file-123.png",
    "src/uploads/certificates/income/file-123.png"
];

paths.forEach(p => {
    console.log(`Original: ${p}`);
    console.log(`Normalized: ${normalizePath(p)}`);
    console.log('---');
});
