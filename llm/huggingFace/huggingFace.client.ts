import axios from "axios";
import UserQuery from "../../model/UserQuery";
import { BaseLLMProcessor } from "../../model/model.interface";
import SystemQuery from '../../model/SystemQuery';

class HuggingFaceClient extends BaseLLMProcessor {
  static completionPath = '/v1/chat/completions';
  static timeout = 60000;

  setSystemQuery(query: SystemQuery) {
    this.systemQuery = query;

    return this;
  }

  setUserQuery(query: UserQuery) {
    this.userQuery = query;

    return this;
  }

  async exec(): Promise<string> {
    if (!this.userQuery) {
      throw new Error('User query is not set');
    }

    const payload = {
      messages: [
        this.systemQuery.toPrompt(),
        this.userQuery.toPrompt()
      ],
      temperature: 0.7,
      max_tokens: -1,
      stream: false
    };
  
    const url = `${this.baseUrl}${HuggingFaceClient.completionPath}`;
  
    const headers = {
      "Content-Type": "application/json",
    };
  
    let response;
  
    try {
      response = await axios.post(url, payload, {
        headers,
        timeout: HuggingFaceClient.timeout
      });
    } catch (error) {
      // TODO(fakhri): handle unexpected error from lmstudio huggingface
      console.log(error);

      throw error;
    }
  
    const content = response.data.choices[0].message.content;

    return content;
  }
}

export default HuggingFaceClient;