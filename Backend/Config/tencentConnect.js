import TLSSigAPIv2 from 'tls-sig-api-v2';

const sdkAppId = Number(process.env.ChatSDK_ID);
const secretKey = process.env.ChatSDK_KEY;

const api = new TLSSigAPIv2.Api(sdkAppId, secretKey);

const generateUserSig = (userId) => {
  return api.genSig(userId.toString(), 60 * 60 * 24 * 7);
};

export { sdkAppId, generateUserSig };
