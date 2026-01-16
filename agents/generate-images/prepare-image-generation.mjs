import { basename } from "node:path";

/**
 * 准备图片生成参数
 * @param {Object} input - 输入参数
 * @param {string} input.key - 图片 key
 * @param {string} input.id - slot id
 * @param {string} input.desc - slot 描述
 * @param {Array} input.documents - 关联文档列表
 * @param {string} input.locale - 主语言
 * @param {boolean} input.isUpdate - 是否为更新模式
 * @param {string|null} input.existingImagePath - 已有图片路径
 * @returns {Object} - 包含原始输入和生图参数
 */
export default function prepareImageGeneration(input) {
  const { desc, documents, locale, isUpdate, existingImagePath } = input;

  // 使用第一篇文档的内容
  const firstDoc = documents[0];
  const documentContent = firstDoc.content;

  // 准备生图参数
  const imageGenParams = {
    documentContent,
    desc,
    locale,
    size: "2K",
    aspectRatio: "4:3",
    useImageToImage: isUpdate || false,
  };

  // 如果是更新模式且有已有图片，添加 existingImage 参数
  if (isUpdate && existingImagePath) {
    imageGenParams.existingImage = [
      {
        type: "local",
        path: existingImagePath,
        filename: basename(existingImagePath),
        mimeType: "image/png",
      },
    ];
  }

  return {
    ...input, // 保留所有原始输入
    ...imageGenParams, // 添加生图参数
  };
}

// 添加描述信息
prepareImageGeneration.description =
  "准备图片生成参数，从关联文档中提取第一篇文档的内容，" +
  "配置生图参数（desc, locale, size, aspectRatio），" +
  "如果是更新模式，添加已有图片路径用于 image-to-image 生成。";

// 定义输入 schema
prepareImageGeneration.input_schema = {
  type: "object",
  properties: {
    key: {
      type: "string",
      description: "图片 key（目录名）",
    },
    id: {
      type: "string",
      description: "slot id",
    },
    desc: {
      type: "string",
      description: "slot 描述",
    },
    documents: {
      type: "array",
      description: "关联文档列表",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          hash: { type: "string" },
          content: { type: "string" },
        },
      },
    },
    locale: {
      type: "string",
      description: "主语言代码",
    },
    isUpdate: {
      type: "boolean",
      description: "是否为更新模式",
    },
    existingImagePath: {
      type: "string",
      nullable: true,
      description: "已有图片路径（更新模式时使用）",
    },
  },
  required: ["key", "id", "desc", "documents", "locale"],
};

// 定义输出 schema
prepareImageGeneration.output_schema = {
  type: "object",
  properties: {
    key: { type: "string" },
    id: { type: "string" },
    desc: { type: "string" },
    documents: { type: "array" },
    locale: { type: "string" },
    isUpdate: { type: "boolean" },
    existingImagePath: { type: "string", nullable: true },
    imageGenParams: {
      type: "object",
      description: "传递给生图 agent 的参数",
      properties: {
        documentContent: { type: "string" },
        desc: { type: "string" },
        locale: { type: "string" },
        size: { type: "string" },
        aspectRatio: { type: "string" },
        useImageToImage: { type: "boolean" },
        existingImage: {
          type: "array",
          nullable: true,
          items: { type: "object" },
        },
      },
    },
  },
};
