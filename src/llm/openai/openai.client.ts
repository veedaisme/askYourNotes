import OpenAI from "openai";
import config from "../../../config";
import IBaseLLMProcessor from "../../model/IBaseLLMProcessor";

class OpenAiClient extends IBaseLLMProcessor {
  private API_KEY = config.openAIKey;
  private openai = new OpenAI({ apiKey: this.API_KEY});

  async exec(): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      messages: [
        this.systemQuery.toPrompt(),
        this.userQuery.toPrompt()
      ],
      model: "gpt-3.5-turbo",
    });

    const content = completion.choices[0].message.content;

    return content as string;
  }
}

export default OpenAiClient;