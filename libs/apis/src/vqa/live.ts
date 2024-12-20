import { VqaApi } from "@thecointech/vqa";

export const GetVqaApi = () => new VqaApi(undefined, process.env.URL_SERVICE_VQA);
