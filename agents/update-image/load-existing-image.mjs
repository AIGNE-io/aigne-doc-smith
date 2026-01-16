import { readFile, access, constants } from "node:fs/promises";
import { join } from "node:path";
import { parse as yamlParse } from "yaml";
import { PATHS } from "../../utils/agent-constants.mjs";
import { parseSlots } from "../../utils/image-slots.mjs";
import { findImageFile, getImageMimeType, calculateContentHash } from "../../utils/image-utils.mjs";
import { loadLocale } from "../../utils/config.mjs";

/**
 * 加载现有图片
 * @param {Object} input - 输入参数
 * @param {string} input.doc - 文档路径（如 "overview" 或 "/overview"）
 * @param {string} input.slotId - slot id
 * @returns {Promise<Object>} - 加载结果
 */
export default async function loadExistingImage(input) {
  try {
    const { doc, slotId } = input;

    // 验证参数
    if (!doc || !slotId) {
      throw new Error("缺少必需参数: doc 和 slotId");
    }

    // 1. 读取主语言
    const locale = await loadLocale();

    // 2. 构建文档文件路径
    const normalizedPath = doc.startsWith("/") ? doc.slice(1) : doc;
    const filePath = join(PATHS.DOCS_DIR, normalizedPath, `${locale}.md`);

    // 检查文件是否存在
    try {
      await access(filePath, constants.F_OK | constants.R_OK);
    } catch (_error) {
      throw new Error(
        `文档不存在或无法读取: ${filePath}, 请检查文档路径是否在 document-structure.yaml 中，并且文档已生成。`,
      );
    }

    // 3. 读取文档内容
    const content = await readFile(filePath, "utf8");

    // 4. 计算文档内容的 hash
    const hash = calculateContentHash(content);

    // 5. 解析 slots，找到指定的 slotId
    const slots = parseSlots(content, doc);
    const targetSlot = slots.find((s) => s.id === slotId);

    if (!targetSlot) {
      throw new Error(`在文档 ${doc} 中未找到 slotId="${slotId}" 的图片 slot`);
    }

    const { key, desc } = targetSlot;

    // 6. 加载图片文件
    const imagesDir = join(PATHS.ASSETS_DIR, key, "images");
    const imagePath = await findImageFile(imagesDir, locale);

    if (!imagePath) {
      throw new Error(
        `未找到 slot "${slotId}" 对应的图片文件（key: ${key}），请向用户确认是否先使用 generateImages Tool 生成图片。`,
      );
    }

    // 7. 读取 .meta.yaml
    const metaPath = join(PATHS.ASSETS_DIR, key, ".meta.yaml");
    let meta = null;
    try {
      const metaContent = await readFile(metaPath, "utf8");
      meta = yamlParse(metaContent);
    } catch (_error) {
      // meta 文件不存在或无法读取，继续执行
    }

    // 8. 构建图片信息（用于 existingImage 参数）
    const mimeType = getImageMimeType(imagePath);
    const filename = imagePath.split("/").pop();

    const existingImage = [
      {
        type: "local",
        path: imagePath,
        filename,
        mimeType,
      },
    ];

    // 9. 获取当前的 aspectRatio（从 meta 或使用默认值）
    const currentAspectRatio = meta?.generation?.aspectRatio || "4:3";

    return {
      success: true,
      slotId,
      key,
      desc,
      doc,
      locale,
      content,
      hash,
      existingImage,
      currentAspectRatio,
      imagePath,
      meta,
      message: `成功加载图片: ${imagePath}`,
    };
  } catch (error) {
    throw new Error(`加载现有图片失败: ${error.message}, 请检查文档路径和 slotId 是否正确`);
  }
}

// 添加描述信息
loadExistingImage.description = "根据文档路径和 slotId 加载现有图片，返回图片路径和相关元信息。";

// 定义输入 schema
loadExistingImage.input_schema = {
  type: "object",
  properties: {
    doc: {
      type: "string",
      description: "文档路径（如 'overview' 或 '/overview'）",
    },
    slotId: {
      type: "string",
      description: "图片 slot 的 id",
    },
  },
  required: ["doc", "slotId"],
};

// 定义输出 schema
loadExistingImage.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "操作是否成功",
    },
    slotId: {
      type: "string",
      description: "slot id",
    },
    key: {
      type: "string",
      description: "图片 key（目录名）",
    },
    desc: {
      type: "string",
      description: "slot 描述",
    },
    doc: {
      type: "string",
      description: "文档路径",
    },
    locale: {
      type: "string",
      description: "主语言代码",
    },
    content: {
      type: "string",
      description: "文档内容",
    },
    hash: {
      type: "string",
      description: "文档内容的 SHA256 hash",
    },
    existingImage: {
      type: "array",
      description: "现有图片信息（用于 image-to-image 生成）",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          path: { type: "string" },
          filename: { type: "string" },
          mimeType: { type: "string" },
        },
      },
    },
    currentAspectRatio: {
      type: "string",
      description: "当前图片的宽高比",
    },
    imagePath: {
      type: "string",
      description: "图片文件路径",
    },
    meta: {
      type: "object",
      nullable: true,
      description: "图片元信息（.meta.yaml 内容）",
    },
    message: {
      type: "string",
      description: "操作结果描述",
    },
    error: {
      type: "string",
      description: "错误代码（失败时存在）",
    },
    suggestion: {
      type: "string",
      description: "建议操作（失败时存在）",
    },
  },
};
