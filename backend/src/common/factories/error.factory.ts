import {
  AUTH_ERROR_CODES,
  KANBAN_ERROR_CODES,
  SPRINT_ERROR_CODES,
  TASK_ERROR_CODES,
  USER_ERROR_CODES,
  WORKSPACE_ERROR_CODES,
} from '../constants/error-codes.constants';

export interface ErrorPayload {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export class ErrorFactory {
  // ─── Auth ───────────────────────────────────────────────────────────────
  static publicLoginFailure(retryAfterSeconds = 0): ErrorPayload {
    const payload: ErrorPayload = {
      message: 'Email hoặc mật khẩu không chính xác.',
      code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    };

    if (retryAfterSeconds > 0) {
      payload.details = this.loginRetryDetails(retryAfterSeconds);
    }

    return payload;
  }

  static loginRetryLater(retryAfterSeconds: number): ErrorPayload {
    return {
      message: 'Vui lòng đợi trước khi thử lại.',
      code: AUTH_ERROR_CODES.LOGIN_RETRY_LATER,
      details: this.loginRetryDetails(retryAfterSeconds),
    };
  }

  private static loginRetryDetails(
    retryAfterSeconds: number,
  ): Record<string, unknown> {
    return {
      retryAfterSeconds,
      retryAt: new Date(Date.now() + retryAfterSeconds * 1000).toISOString(),
    };
  }

  static emailNotVerified(): ErrorPayload {
    return {
      message: 'Vui lòng xác thực email trước khi đăng nhập.',
      code: AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED,
    };
  }

  static accountSuspended(): ErrorPayload {
    return {
      message: 'Tài khoản đã bị khóa hoặc tạm ngưng.',
      code: AUTH_ERROR_CODES.USER_SUSPENDED,
    };
  }

  static accountDeactivated(): ErrorPayload {
    return {
      message: 'Tài khoản đã bị khóa hoặc tạm ngưng.',
      code: AUTH_ERROR_CODES.USER_DEACTIVATED,
    };
  }

  // ─── Tasks ──────────────────────────────────────────────────────────────
  static taskNotFound(id?: string): ErrorPayload {
    return {
      message: id
        ? `Không tìm thấy nhiệm vụ với ID "${id}"`
        : 'Không tìm thấy nhiệm vụ',
      code: TASK_ERROR_CODES.TASK_NOT_FOUND,
    };
  }

  static taskArchived(): ErrorPayload {
    return {
      message: 'Nhiệm vụ đã lưu trữ chỉ có thể xem.',
      code: TASK_ERROR_CODES.TASK_ARCHIVED,
    };
  }

  static taskKeyConflict(key: string): ErrorPayload {
    return {
      message: `Mã nhiệm vụ "${key}" đã trùng với một nhiệm vụ khác.`,
      code: TASK_ERROR_CODES.TASK_KEY_CONFLICT,
    };
  }

  // ─── Scrum / Sprint ─────────────────────────────────────────────────────
  static sprintNotFound(id?: string): ErrorPayload {
    return {
      message: id
        ? `Không tìm thấy sprint với ID "${id}"`
        : 'Không tìm thấy sprint',
      code: SPRINT_ERROR_CODES.SPRINT_NOT_FOUND,
    };
  }

  static sprintInvalidStatus(expected: string, actual: string): ErrorPayload {
    return {
      message: `Sprint phải ở trạng thái "${expected}", nhưng hiện tại là "${actual}".`,
      code: SPRINT_ERROR_CODES.SPRINT_INVALID_STATUS,
    };
  }

  static activeSprintExists(): ErrorPayload {
    return {
      message:
        'Không thể bắt đầu sprint: Đã có sprint đang hoạt động trong không gian làm việc này.',
      code: SPRINT_ERROR_CODES.ACTIVE_SPRINT_EXISTS,
    };
  }

  static sprintTargetInvalid(): ErrorPayload {
    return {
      message:
        'Sprint đích phải tồn tại, thuộc cùng không gian làm việc và đang ở trạng thái lên kế hoạch.',
      code: SPRINT_ERROR_CODES.SPRINT_TARGET_INVALID,
    };
  }

  static invalidIdFormat(resourceName: string): ErrorPayload {
    return {
      message: `Định dạng ID ${resourceName} không hợp lệ`,
      code: SPRINT_ERROR_CODES.INVALID_ID_FORMAT,
    };
  }

  // ─── Kanban ──────────────────────────────────────────────────────────────
  static invalidColumnName(): ErrorPayload {
    return {
      message: 'Tên cột không được để trống.',
      code: KANBAN_ERROR_CODES.INVALID_COLUMN_NAME,
    };
  }

  static duplicateColumnName(): ErrorPayload {
    return {
      message: 'Cột với tên này đã tồn tại.',
      code: KANBAN_ERROR_CODES.DUPLICATE_COLUMN_NAME,
    };
  }

  // ─── Workspace ──────────────────────────────────────────────────────────
  static workspaceNotFound(id?: string): ErrorPayload {
    return {
      message: id
        ? `Không tìm thấy không gian làm việc với ID "${id}"`
        : 'Không tìm thấy không gian làm việc',
      code: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
    };
  }

  static workspaceMemberNotFound(userId?: string): ErrorPayload {
    return {
      message: userId
        ? `Người dùng "${userId}" không phải là thành viên`
        : 'Người dùng không phải là thành viên',
      code: WORKSPACE_ERROR_CODES.WORKSPACE_MEMBER_NOT_FOUND,
    };
  }

  static workspaceKeyConflict(): ErrorPayload {
    return {
      message: 'Không thể tạo mã không gian làm việc duy nhất.',
      code: WORKSPACE_ERROR_CODES.WORKSPACE_KEY_CONFLICT,
    };
  }

  static cannotRemoveOwner(): ErrorPayload {
    return {
      message: 'Không thể xóa chủ sở hữu không gian làm việc.',
      code: WORKSPACE_ERROR_CODES.CANNOT_REMOVE_OWNER,
    };
  }

  static cannotChangeOwnerRole(): ErrorPayload {
    return {
      message: 'Không thể thay đổi vai trò của chủ sở hữu.',
      code: WORKSPACE_ERROR_CODES.CANNOT_CHANGE_OWNER_ROLE,
    };
  }

  static inviteNotFound(): ErrorPayload {
    return {
      message: 'Không tìm thấy lời mời.',
      code: WORKSPACE_ERROR_CODES.INVITE_NOT_FOUND,
    };
  }

  static inviteAlreadyAccepted(): ErrorPayload {
    return {
      message: 'Lời mời này đã được chấp nhận.',
      code: WORKSPACE_ERROR_CODES.INVITE_ACCEPTED,
    };
  }

  static inviteAlreadyDeclined(): ErrorPayload {
    return {
      message: 'Lời mời này đã bị từ chối.',
      code: WORKSPACE_ERROR_CODES.INVITE_DECLINED,
    };
  }

  static inviteUnavailable(): ErrorPayload {
    return {
      message: 'Lời mời này không còn khả dụng.',
      code: WORKSPACE_ERROR_CODES.INVITE_UNAVAILABLE,
    };
  }

  static inviteExpired(): ErrorPayload {
    return {
      message: 'Lời mời này đã hết hạn.',
      code: WORKSPACE_ERROR_CODES.INVITE_EXPIRED,
    };
  }

  static memberAlreadyExists(): ErrorPayload {
    return {
      message: 'Bạn đã là thành viên của không gian làm việc này.',
      code: WORKSPACE_ERROR_CODES.MEMBER_ALREADY_EXISTS,
    };
  }

  static inviteAlreadyPending(): ErrorPayload {
    return {
      message: 'Lời mời đang chờ xử lý cho email này.',
      code: WORKSPACE_ERROR_CODES.INVITE_ALREADY_PENDING,
    };
  }

  static inviteWorkspaceMismatch(): ErrorPayload {
    return {
      message: 'Lời mời không thuộc về không gian làm việc này.',
      code: WORKSPACE_ERROR_CODES.INVITE_WORKSPACE_MISMATCH,
    };
  }

  static frontendUrlNotConfigured(): ErrorPayload {
    return {
      message: 'FRONTEND_URL chưa được cấu hình.',
      code: WORKSPACE_ERROR_CODES.FRONTEND_URL_NOT_CONFIGURED,
    };
  }

  // ─── User ───────────────────────────────────────────────────────────────
  static userNotFound(id?: string): ErrorPayload {
    return {
      message: id
        ? `Không tìm thấy người dùng với ID "${id}"`
        : 'Không tìm thấy người dùng',
      code: USER_ERROR_CODES.USER_NOT_FOUND,
    };
  }

  static invalidUserId(): ErrorPayload {
    return {
      message: 'Định dạng ID người dùng không hợp lệ.',
      code: USER_ERROR_CODES.INVALID_USER_ID,
    };
  }

  static currentPasswordIncorrect(): ErrorPayload {
    return {
      message: 'Mật khẩu hiện tại không đúng.',
      code: USER_ERROR_CODES.CURRENT_PASSWORD_INCORRECT,
    };
  }

  static passwordHasWhitespace(): ErrorPayload {
    return {
      message: 'Mật khẩu không được chứa khoảng trắng ở đầu hoặc cuối.',
      code: USER_ERROR_CODES.PASSWORD_HAS_WHITESPACE,
    };
  }
}
