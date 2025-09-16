import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import dedent from 'dedent';

export const user_statistics = {
  name: 'user_statistics',
  description: dedent`현재 서비스의 사용자 관련 지표 정보를 조회합니다. 해당 기간의 가입자, 탈퇴자, 유료 사용자, 결제 건수에 대한 데이터를 조회할 수 있습니다. 
    파라미터를 입력하지 않으면 기본값으로 이번 달 1일 0시 ~ 현재 시각까지를 조회합니다. 최대 한 달(31일)의 데이터를 조회 가능합니다. 
    반환값은 JSON 오브젝트 문자열이며 결괏값의 속성은 다음과 같습니다. 
      - totalUsers: 전체 가입자 수
      - totalSubscribers: 전체 구독자 수
      - newSubscribers: 해당 기간 동안의 구독자 수
      - withdrawnMembers: 해당 기간 동안의 탈퇴자 수
      - paidUsers: 전체 구독자 중 유료 사용자의 수
      - paymentCount: 해당 기간 동안 결제 건수
      - startdate: 조회 시작일 (UTC 기준의 ISO Date 문자열(예: 2025-06-01T07:47:02.647Z)
      - enddate: 조회 마지막일 (UTC 기준의 ISO Date 문자열(예: 2025-06-01T07:47:02.647Z)
    `,
  args: {
    startdate: z.string().describe('조회 시작일, 지정하지 않을 경우 이번달 1일 0시, UTC 기준의 ISO Date 문자열(예: 2025-06-01T07:47:02.647Z)을 입력하세요'),
    enddate: z.string().describe('조회 마지막일, 지정하지 않을 경우 현재 시각, UTC 기준의 ISO Date 문자열(예: 2025-06-01T07:47:02.647Z)을 입력하세요')
  },
  handle: async ({ startdate = null, enddate = null }): Promise<CallToolResult> => {
    if (!startdate) throw new Error(`startdate is required`);
    if (!enddate) throw new Error(`enddate is required`);

    const data = {
      totalUsers: 1003,
      totalSubscribers: 300,
      newSubscribers: 30,
      withdrawnMembers: 3,
      paidUsers: 400,
      paymentCount: 45,
      startdate,
      enddate
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data)
        }
      ]
    };
  }
};
