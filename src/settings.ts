import {
  AZURE_OPENAI,
  COHEREAI,
  ChatModelDisplayNames,
  DEFAULT_SETTINGS,
  DISPLAY_NAME_TO_MODEL,
  HUGGINGFACE,
  OPENAI
} from "@/constants";
import CopilotPlugin from "@/main";
import { App, DropdownComponent, Notice, PluginSettingTab, Setting } from "obsidian";

export class CopilotSettingTab extends PluginSettingTab {
  plugin: CopilotPlugin;

  constructor(app: App, plugin: CopilotPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  async reloadPlugin() {
    try {
      // Save the settings before reloading
      await this.plugin.saveSettings();

      // Reload the plugin
      const app = (this.plugin.app as any);
      await app.plugins.disablePlugin("copilot");
      await app.plugins.enablePlugin("copilot");

      app.setting.openTabById("copilot").display();
      new Notice('Plugin reloaded successfully.');
    } catch (error) {
      new Notice('Failed to reload the plugin. Please reload manually.');
      console.error('Error reloading plugin:', error);
    }
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.style.userSelect = 'text';
    containerEl.createEl('h2', { text: 'Copilot Settings' });

    const buttonContainer = containerEl.createDiv({ cls: 'button-container' });
    buttonContainer.createEl('button', {
      text: 'Save and Reload',
      type: 'button',
      cls: 'mod-cta',
    }).addEventListener('click', async () => {
      await this.plugin.saveSettings();
      await this.reloadPlugin();
      new Notice('Settings have been saved and the plugin has been reloaded.');
    });

    buttonContainer.createEl('button', {
      text: 'Reset to Default Settings',
      type: 'button',
      cls: 'mod-cta',
    }).addEventListener('click', async () => {
      this.plugin.settings = DEFAULT_SETTINGS;
      await this.plugin.saveSettings();
      await this.reloadPlugin();
      new Notice('Settings have been reset to their default values.');
    });

    containerEl.createEl('div', {
      text: 'Please Save and Reload the plugin when you change any setting below!',
      cls: 'warning-message'
    });


    const modelDisplayNames = [
      ChatModelDisplayNames.GPT_35_TURBO,
      ChatModelDisplayNames.GPT_35_TURBO_16K,
      ChatModelDisplayNames.GPT_4,
      ChatModelDisplayNames.GPT_4_TURBO,
      ChatModelDisplayNames.GPT_4_32K,
      // ChatModelDisplayNames.CLAUDE_1,
      // ChatModelDisplayNames.CLAUDE_1_100K,
      // ChatModelDisplayNames.CLAUDE_INSTANT_1,
      // ChatModelDisplayNames.CLAUDE_INSTANT_1_100K,
      ChatModelDisplayNames.AZURE_GPT_35_TURBO,
      ChatModelDisplayNames.AZURE_GPT_35_TURBO_16K,
      ChatModelDisplayNames.AZURE_GPT_4,
      ChatModelDisplayNames.AZURE_GPT_4_32K,
      ChatModelDisplayNames.GEMINI_PRO,
      ChatModelDisplayNames.OPENROUTERAI,
      ChatModelDisplayNames.LM_STUDIO,
      ChatModelDisplayNames.OLLAMA,
    ];

    new Setting(containerEl)
      .setName("Default Model")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("The default model to use");
        })
      )
      .addDropdown((dropdown: DropdownComponent) => {
        modelDisplayNames.forEach(displayName => {
          dropdown.addOption(displayName, displayName);
        });
        dropdown
          .setValue(this.plugin.settings.defaultModelDisplayName)
          .onChange(async (value: string) => {
            this.plugin.settings.defaultModelDisplayName = value;
            this.plugin.settings.defaultModel = DISPLAY_NAME_TO_MODEL[this.plugin.settings.defaultModelDisplayName];
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Default Conversation Folder Name")
      .setDesc("The default folder name where chat conversations will be saved. Default is 'copilot-conversations'")
      .addText(text => text
          .setPlaceholder("copilot-conversations")
          .setValue(this.plugin.settings.defaultSaveFolder)
          .onChange(async (value: string) => {
              this.plugin.settings.defaultSaveFolder = value;
              await this.plugin.saveSettings();
          })
      );

    containerEl.createEl('h4', { text: 'API Settings' });
    containerEl.createEl('h6', { text: 'OpenAI API' });

    new Setting(containerEl)
      .setName("Your OpenAI API key")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("You can find your API key at ");
          frag.createEl('a', {
            text: "https://platform.openai.com/api-keys",
            href: "https://platform.openai.com/api-keys"
          });
          frag.createEl('br');
          frag.appendText(
            "It is stored locally in your vault at "
          );
          frag.createEl('br');
          frag.createEl(
            'strong',
            { text: "path_to_your_vault/.obsidian/plugins/obsidian-copilot/data.json" }
          );
          frag.createEl('br');
          frag.appendText("and it is only used to make requests to OpenAI.");
        })
      )
      .addText((text) => {
        text.inputEl.type = "password";
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder("OpenAI API key")
          .setValue(this.plugin.settings.openAIApiKey)
          .onChange(async (value) => {
            this.plugin.settings.openAIApiKey = value;
            await this.plugin.saveSettings();
          })
      }
      );

    const warningMessage = containerEl.createEl('div', { cls: 'warning-message' });

    warningMessage.createEl('span', {
        text: 'If errors occur, pls re-enter the API key, save and reload the plugin to see if it resolves the issue.'
    });

    warningMessage.createEl('br');

    warningMessage.createEl('span', {
        text: 'If you are a new user, try '
    });

    warningMessage.createEl('a', {
        text: 'OpenAI playground',
        href: 'https://platform.openai.com/playground?mode=chat'
    });

    warningMessage.createEl('span', {
        text: ' to see if you have correct API access first.'
    });

    // containerEl.createEl('h6', { text: 'Anthropic' });

    // new Setting(containerEl)
    //   .setName("Your Anthropic API key")
    //   .setDesc(
    //     createFragment((frag) => {
    //       frag.appendText("This is for Claude models. Sign up on their waitlist if you don't have access.");
    //       frag.createEl('a', {
    //         text: "https://docs.anthropic.com/claude/docs/getting-access-to-claude",
    //         href: "https://docs.anthropic.com/claude/docs/getting-access-to-claude"
    //       });
    //     })
    //   )
    //   .addText((text) => {
    //     text.inputEl.type = "password";
    //     text.inputEl.style.width = "100%";
    //     text
    //       .setPlaceholder("Anthropic API key")
    //       .setValue(this.plugin.settings.anthropicApiKey)
    //       .onChange(async (value) => {
    //         this.plugin.settings.anthropicApiKey = value;
    //         await this.plugin.saveSettings();
    //       })
    //   }
    //   );

    containerEl.createEl('h6', { text: 'Google Gemini API' });

    new Setting(containerEl)
      .setName("Your Google API key")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("If you have Google Cloud, you can get Gemini API key ");
          frag.createEl('a', {
            text: "here",
            href: "https://makersuite.google.com/app/apikey"
          });
        })
      )
      .addText((text) => {
        text.inputEl.type = "password";
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder("Google API key")
          .setValue(this.plugin.settings.googleApiKey)
          .onChange(async (value) => {
            this.plugin.settings.googleApiKey = value;
            await this.plugin.saveSettings();
          })
      }
      );

    containerEl.createEl('h6', { text: 'OpenRouter.ai API' });

    new Setting(containerEl)
      .setName("Your OpenRouterAI API key")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("You can get your OpenRouterAI key ");
          frag.createEl('a', {
            text: "here",
            href: "https://openrouter.ai/keys"
          });
        })
      )
      .addText((text) => {
        text.inputEl.type = "password";
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder("OpenRouterAI API key")
          .setValue(this.plugin.settings.openRouterAiApiKey)
          .onChange(async (value) => {
            this.plugin.settings.openRouterAiApiKey = value;
            await this.plugin.saveSettings();
          })
      });

    new Setting(containerEl)
      .setName("OpenRouterAI model")
      .setDesc("Default: cognitivecomputations/dolphin-mixtral-8x7b")
      .addText(text => {
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder("cognitivecomputations/dolphin-mixtral-8x7b")
          .setValue(this.plugin.settings.openRouterModel)
          .onChange(async (value: string) => {
              this.plugin.settings.openRouterModel = value;
              await this.plugin.saveSettings();
          })
      });

    containerEl.createEl('h6', { text: 'Azure OpenAI API' });

    new Setting(containerEl)
      .setName("Your Azure OpenAI API key")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("This is for Azure OpenAI APIs. Sign up on their waitlist if you don't have access.");
        })
      )
      .addText((text) => {
        text.inputEl.type = "password";
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder("Azure OpenAI API key")
          .setValue(this.plugin.settings.azureOpenAIApiKey)
          .onChange(async (value) => {
            this.plugin.settings.azureOpenAIApiKey = value;
            await this.plugin.saveSettings();
          })
      }
      );

    new Setting(containerEl)
      .setName("Your Azure OpenAI instance name")
      .addText((text) => {
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder("Azure OpenAI instance name")
          .setValue(this.plugin.settings.azureOpenAIApiInstanceName)
          .onChange(async (value) => {
            this.plugin.settings.azureOpenAIApiInstanceName = value;
            await this.plugin.saveSettings();
          })
      }
      );

    new Setting(containerEl)
      .setName("Your Azure OpenAI deployment name")
      .addText((text) => {
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder("Azure OpenAI deployment name")
          .setValue(this.plugin.settings.azureOpenAIApiDeploymentName)
          .onChange(async (value) => {
            this.plugin.settings.azureOpenAIApiDeploymentName = value;
            await this.plugin.saveSettings();
          })
      }
      );

    new Setting(containerEl)
      .setName("Your Azure OpenAI API version")
      .addText((text) => {
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder("Azure OpenAI API version")
          .setValue(this.plugin.settings.azureOpenAIApiVersion)
          .onChange(async (value) => {
            this.plugin.settings.azureOpenAIApiVersion = value;
            await this.plugin.saveSettings();
          })
      }
      );

    new Setting(containerEl)
      .setName("Your Azure OpenAI embedding model deployment name (Optional)")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("Only if you'd like to use Azure as the embedding provider.");
        })
      )
      .addText((text) => {
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder("Azure OpenAI embedding model deployment name")
          .setValue(this.plugin.settings.azureOpenAIApiEmbeddingDeploymentName)
          .onChange(async (value) => {
            this.plugin.settings.azureOpenAIApiEmbeddingDeploymentName = value;
            await this.plugin.saveSettings();
          })
      }
      );

    containerEl.createEl(
      'h6',
      {
        text: 'Please be mindful of the number of tokens and context conversation turns you set here, as they will affect the cost of your API requests.'
      }
    );

    new Setting(containerEl)
      .setName("Temperature")
      .setDesc(
        createFragment((frag) => {
          frag.appendText(
            "Default is 0.7. Higher values will result in more creativeness, but also more mistakes. Set to 0 for no randomness."
          );
        })
      )
      .addSlider(slider =>
        slider
          .setLimits(0, 2, 0.05)
          .setValue(
            this.plugin.settings.temperature !== undefined &&
              this.plugin.settings.temperature !== null ?
              this.plugin.settings.temperature : 0.7
          )
          .setDynamicTooltip()
          .onChange(async value => {
            this.plugin.settings.temperature = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Token limit")
      .setDesc(
        createFragment((frag) => {
          frag.appendText(
            "The maximum number of output tokens to generate. Default is 1000."
          );
          frag.createEl(
            'strong',
            {
              text: 'This number plus the length of your prompt (input tokens) must be smaller than the context window of the model.'
            }
          )
        })
      )
      .addSlider(slider =>
        slider
          .setLimits(0, 10000, 100)
          .setValue(
            this.plugin.settings.maxTokens !== undefined &&
              this.plugin.settings.maxTokens !== null ?
              this.plugin.settings.maxTokens : 1000
          )
          .setDynamicTooltip()
          .onChange(async value => {
            this.plugin.settings.maxTokens = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Conversation turns in context")
      .setDesc(
        createFragment((frag) => {
          frag.appendText(
            "The number of previous conversation turns to include in the context. Default is 3 turns, i.e. 6 messages."
          );
        })
      )
      .addSlider(slider =>
        slider
          .setLimits(1, 30, 1)
          .setValue(
            this.plugin.settings.contextTurns !== undefined &&
              this.plugin.settings.contextTurns !== null ?
              this.plugin.settings.contextTurns : 3
          )
          .setDynamicTooltip()
          .onChange(async value => {
            this.plugin.settings.contextTurns = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl('h4', { text: 'Vector-based QA Settings (Beta). No context limit!' });
    containerEl.createEl('p', { text: 'To start the QA session, use the Mode Selection dropdown and select "QA". Switch back to "Chat" when you are done!' });
    containerEl.createEl(
      'p',
      {
        text: 'NOTE: OpenAI embeddings are not free but may give better QA results. CohereAI offers trial API for FREE and the quality is very good! It is more stable than Huggingface Inference API (more timeouts).'
      }
    );

    new Setting(containerEl)
      .setName("Embedding Provider")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("The embedding provider to use");
        })
      )
      .addDropdown((dropdown: DropdownComponent) => {
        dropdown
          .addOption(OPENAI, 'OpenAI')
          .addOption(COHEREAI, 'CohereAI')
          .addOption(AZURE_OPENAI, 'Azure OpenAI')
          .addOption(HUGGINGFACE, 'Huggingface')
          .setValue(this.plugin.settings.embeddingProvider)
          .onChange(async (value: string) => {
            this.plugin.settings.embeddingProvider = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("TTL (Days)")
      .setDesc("Specify the Time To Live (TTL) for the saved embeddings in days. Default is 30 days. Embeddings older than the TTL will be deleted automatically to save storage space.")
      .addText((text) => {
        text
          .setPlaceholder("30")
          .setValue(this.plugin.settings.ttlDays ? this.plugin.settings.ttlDays.toString() : '')
          .onChange(async (value: string) => {
            const intValue = parseInt(value);
            if (!isNaN(intValue)) {
              this.plugin.settings.ttlDays = intValue;
              await this.plugin.saveSettings();
            }
          });
      });


    new Setting(containerEl)
      .setName("Your CohereAI trial API key")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("You can sign up at CohereAI and find your API key at ");
          frag.createEl('a', {
            text: "https://dashboard.cohere.ai/api-keys",
            href: "https://dashboard.cohere.ai/api-keys"
          });
          frag.createEl('br');
          frag.appendText("It is used to make requests to CohereAI trial API for free embeddings.");
        })
      )
      .addText((text) => {
        text.inputEl.type = "password";
        text.inputEl.style.width = "80%";
        text
          .setPlaceholder("CohereAI trial API key")
          .setValue(this.plugin.settings.cohereApiKey)
          .onChange(async (value) => {
            this.plugin.settings.cohereApiKey = value;
            await this.plugin.saveSettings();
          })
      }
      );

    new Setting(containerEl)
      .setName("Your Huggingface Inference API key")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("You can find your API key at ");
          frag.createEl('a', {
            text: "https://hf.co/settings/tokens",
            href: "https://hf.co/settings/tokens"
          });
          frag.createEl('br');
          frag.appendText("It is used to make requests to Huggingface Inference API for free embeddings.");
          frag.createEl('br');
          frag.createEl('strong', {
            text: "Please note that the quality may be worse than OpenAI embeddings,"
          });
          frag.createEl('br');
          frag.createEl('strong', {
            text: "and may have more API timeout errors."
          });
        })
      )
      .addText((text) => {
        text.inputEl.type = "password";
        text.inputEl.style.width = "80%";
        text
          .setPlaceholder("Huggingface Inference API key")
          .setValue(this.plugin.settings.huggingfaceApiKey)
          .onChange(async (value) => {
            this.plugin.settings.huggingfaceApiKey = value;
            await this.plugin.saveSettings();
          })
      }
      );

    containerEl.createEl('h4', { text: 'Advanced Settings' });

    new Setting(containerEl)
      .setName("User custom system prompt")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("You can set your own system prompt here. ")
          frag.createEl(
            'strong',
            { text: "Warning: It will override the default system prompt for all messages! " }
          );
          frag.appendText(
            "Use with caution! Also note that OpenAI can return error codes for some system prompts."
          );
        })
      )
      .addTextArea(text => {
        text.inputEl.style.width = "200px";
        text.inputEl.style.height = "100px";
        text
          .setPlaceholder("User system prompt")
          .setValue(this.plugin.settings.userSystemPrompt)
          .onChange(async (value) => {
            this.plugin.settings.userSystemPrompt = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("OpenAI Proxy Base URL (3rd-party providers)")
      .setDesc(
        createFragment((frag) => {
          frag.createEl(
            'strong',
            { text: "CAUTION: This overrides the OpenAI API URL " },
          );
          frag.createEl('br');
          frag.createEl('strong', {
            text: "for both chat and embedding models when OpenAI models are picked!"
          });
          frag.createEl('br');
          frag.appendText(" Leave blank to use the official OpenAI API.");
        })
      )
      .addText((text) => {
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder("https://openai.example.com/v1")
          .setValue(this.plugin.settings.openAIProxyBaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.openAIProxyBaseUrl = value;
            await this.plugin.saveSettings();
          })
      });

    containerEl.createEl('h4', { text: 'Local Copilot (No Internet Required!)' });
    containerEl.createEl('div', {
      text: 'Please check the doc to set up LM Studio or Ollama server on your device.',
      cls: 'warning-message'
    });
    containerEl.createEl('p', { text: 'Local models can be limited in capabilities and may not work for some use cases at this time. Keep in mind that it is still in early experimental phase. But some 13B even 7B models are already quite capable!' });


    containerEl.createEl('h5', { text: 'LM Studio' });
    containerEl.createEl('p', { text: 'To use Local Copilot with LM Studio:' });
    containerEl.createEl('p', { text: '1. Start LM Studio server with CORS on. Default port is 1234 but if you change it, you can provide it below.' });
    containerEl.createEl('p', { text: '2. Pick LM Studio in the Copilot Chat model selection dropdown to chat with it!' });

    new Setting(containerEl)
      .setName("LM Studio server port")
      .setDesc("The default is 1234")
      .addText(text => text
          .setPlaceholder("1234")
          .setValue(this.plugin.settings.lmStudioPort)
          .onChange(async (value: string) => {
              this.plugin.settings.lmStudioPort = value;
              await this.plugin.saveSettings();
          })
      );

    containerEl.createEl('h5', { text: 'Ollama' });
    containerEl.createEl('p', { text: 'To use Local Copilot with Ollama, pick Ollama in the Copilot Chat model selection dropdown.' });
    containerEl.createEl('p', { text: 'Run the local Ollama server by running this in your terminal:' });
    containerEl.createEl(
      'strong',
      { text: "OLLAMA_ORIGINS=app://obsidian.md* ollama serve" }
    );

    new Setting(containerEl)
      .setName("Ollama model")
      .setDesc("The default is llama2")
      .addText(text => text
          .setPlaceholder("llama2")
          .setValue(this.plugin.settings.ollamaModel)
          .onChange(async (value: string) => {
              this.plugin.settings.ollamaModel = value;
              await this.plugin.saveSettings();
          })
      );

    containerEl.createEl('h4', { text: 'Development mode' });

    new Setting(containerEl)
      .setName("Debug mode")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("Debug mode will log all API requests and prompts to the console.");
        })
      )
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.debug)
        .onChange(async (value) => {
          this.plugin.settings.debug = value;
          await this.plugin.saveSettings();
        })
      );
  }
}