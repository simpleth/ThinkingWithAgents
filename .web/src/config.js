export const CONFIG = {
  HOME: {
    RECENT_ARTICLES_COUNT: 5,
    FEATURED_ARTICLES_COUNT: 3,
    DESCRIPTION_MAX_LENGTH: 200,
    FALLBACK_DESCRIPTION_LENGTH: 100
  },
  ARTICLE: {
    RELATED_ARTICLES_COUNT: 3
  },
  HEADER: {
    HEIGHT: 70,
    SIDEBAR_WIDTH: 280,
    MOBILE_BREAKPOINT: 768
  },
  CATEGORY: {
    ARTICLES_PER_PAGE: 10
  }
}

export const REGEX_PATTERNS = {
  BOLD: /\*\*/g,
  VERSION_LABEL: /版本：\s*\S+/g,
  UPDATE_LABEL: /更新：\s*\S+/g,
  SOURCE_LABEL: /来源：\s*\S+/g,
  ANGLE_BRACKET: />/g,
  ASTERISK: /\*/g,
  BACKTICK: /`/g,
  MARKDOWN_LINK: /\[([^\]]+)\]\([^)]+\)/g,
  MULTIPLE_SPACES: /\s+/g,
  MARKDOWN_FORMAT: /[#*>`_\[\]()!]/g,
  NEWLINE: /\n+/g
}