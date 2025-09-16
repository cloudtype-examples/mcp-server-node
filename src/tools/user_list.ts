import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import dedent from 'dedent';

export const user_list = {
  name: 'user_list',
  description: dedent`서비스를 이용 중인 현재 사용자 목록를 조회합니다. 해당 기간과 페이지에 해당하는 사용자 목록을 조회할 수 있습니다. 
    파라미터를 입력하지 않으면 기본값으로 이번 달 1일 0시 ~ 현재 시각까지를 조회합니다. 최대 한 달(31일)의 데이터를 조회 가능합니다. 
    반환값은 JSON 오브젝트 문자열이며 결괏값의 속성은 다음과 같습니다. 
      - users: 검색된 사용자 정보 배열
        - uid: 사용자의 uid
        - name: 사용자의 이름
        - email: 사용자의 이메일
        - createdAt: 가입일
        - updatedAt: 최근 정보 업데이트일
      - offset: 검색된 데이터의 조회 offset, 기본값은 0입니다.
      - limit: 검색된 데이터의 조회 limit, 최대값은 20입니다.
      - total: 검색 범위의 전체 사용자 수
      - startdate: 조회 시작일 (UTC 기준의 ISO Date 문자열(예: 2025-06-01T07:47:02.647Z)
      - enddate: 조회 마지막일 (UTC 기준의 ISO Date 문자열(예: 2025-06-01T07:47:02.647Z)
    `,
  args: {
    startdate: z.string().describe('조회 시작일, 지정하지 않을 경우 이번달 1일 0시, UTC 기준의 ISO Date 문자열(예: 2025-06-01T07:47:02.647Z)을 입력하세요'),
    enddate: z.string().describe('조회 마지막일, 지정하지 않을 경우 현재 시각, UTC 기준의 ISO Date 문자열(예: 2025-06-01T07:47:02.647Z)을 입력하세요'),
    offset: z.number().describe('데이터의 조회 offset, 기본값은 0입니다.'),
    limit: z.number().describe('데이터의 조회 limit, 기본값은 10, 최대값은 20입니다.')
  },
  handle: async ({ startdate = null, enddate = null, offset = 0, limit = 10 }): Promise<CallToolResult> => {
    if (!startdate) throw new Error(`startdate is required`);
    if (!enddate) throw new Error(`enddate is required`);

    const data = {
      users: [
        {
          uid: 'user_0001',
          name: 'Alice Kim',
          email: 'alice.kim@example.com',
          createdAt: '2025-06-02T09:00:15.000Z',
          updatedAt: '2025-07-01T11:30:20.000Z'
        },
        {
          uid: 'user_0002',
          name: 'Brian Lee',
          email: 'brian.lee@example.com',
          createdAt: '2025-06-02T10:14:32.000Z',
          updatedAt: '2025-06-28T15:22:40.000Z'
        },
        {
          uid: 'user_0003',
          name: 'Claire Park',
          email: 'claire.park@example.com',
          createdAt: '2025-06-03T08:35:12.947Z',
          updatedAt: '2025-07-12T19:13:13.108Z'
        },
        {
          uid: 'user_0004',
          name: 'David Cho',
          email: 'david.cho@example.com',
          createdAt: '2025-06-03T12:45:41.742Z',
          updatedAt: '2025-07-10T08:39:51.000Z'
        },
        {
          uid: 'user_0005',
          name: 'Eve Jung',
          email: 'eve.jung@example.com',
          createdAt: '2025-06-04T07:26:52.217Z',
          updatedAt: '2025-06-29T09:45:00.000Z'
        },
        {
          uid: 'user_0006',
          name: 'Frank Shin',
          email: 'frank.shin@example.com',
          createdAt: '2025-06-05T13:10:24.478Z',
          updatedAt: '2025-06-30T17:12:40.000Z'
        },
        {
          uid: 'user_0007',
          name: 'Grace Moon',
          email: 'grace.moon@example.com',
          createdAt: '2025-06-06T06:17:59.000Z',
          updatedAt: '2025-07-06T03:43:08.000Z'
        },
        {
          uid: 'user_0008',
          name: 'Henry Choi',
          email: 'henry.choi@example.com',
          createdAt: '2025-06-07T08:51:37.000Z',
          updatedAt: '2025-07-11T22:19:46.900Z'
        },
        {
          uid: 'user_0009',
          name: 'Isabella Han',
          email: 'isabella.han@example.com',
          createdAt: '2025-06-07T15:22:18.500Z',
          updatedAt: '2025-07-14T05:21:10.000Z'
        },
        {
          uid: 'user_0010',
          name: 'James Lim',
          email: 'james.lim@example.com',
          createdAt: '2025-06-08T07:05:01.000Z',
          updatedAt: '2025-07-13T09:30:27.000Z'
        },
        {
          uid: 'user_0011',
          name: 'Katie Oh',
          email: 'katie.oh@example.com',
          createdAt: '2025-06-09T10:27:49.000Z',
          updatedAt: '2025-07-03T13:14:34.100Z'
        },
        {
          uid: 'user_0012',
          name: 'Leo Kim',
          email: 'leo.kim@example.com',
          createdAt: '2025-06-09T16:40:30.000Z',
          updatedAt: '2025-07-09T22:40:51.621Z'
        },
        {
          uid: 'user_0013',
          name: 'Mina Woo',
          email: 'mina.woo@example.com',
          createdAt: '2025-06-11T14:30:55.000Z',
          updatedAt: '2025-07-05T18:20:13.432Z'
        },
        {
          uid: 'user_0014',
          name: 'Nathan Ryu',
          email: 'nathan.ryu@example.com',
          createdAt: '2025-06-12T09:57:43.000Z',
          updatedAt: '2025-07-08T07:05:47.000Z'
        },
        {
          uid: 'user_0015',
          name: 'Olivia Seo',
          email: 'olivia.seo@example.com',
          createdAt: '2025-06-13T08:20:19.700Z',
          updatedAt: '2025-07-02T11:53:41.000Z'
        },
        {
          uid: 'user_0016',
          name: 'Peter Yoon',
          email: 'peter.yoon@example.com',
          createdAt: '2025-06-14T11:44:31.000Z',
          updatedAt: '2025-07-07T04:41:03.000Z'
        },
        {
          uid: 'user_0017',
          name: 'Qi Zhang',
          email: 'qi.zhang@example.com',
          createdAt: '2025-06-15T15:12:42.000Z',
          updatedAt: '2025-07-04T10:02:39.512Z'
        },
        {
          uid: 'user_0018',
          name: 'Rachel Jang',
          email: 'rachel.jang@example.com',
          createdAt: '2025-06-16T08:33:20.000Z',
          updatedAt: '2025-07-12T09:19:53.000Z'
        },
        {
          uid: 'user_0019',
          name: 'Samuel Park',
          email: 'samuel.park@example.com',
          createdAt: '2025-06-17T17:20:11.900Z',
          updatedAt: '2025-07-01T21:55:34.000Z'
        },
        {
          uid: 'user_0020',
          name: 'Tina Kim',
          email: 'tina.kim@example.com',
          createdAt: '2025-06-18T07:12:08.000Z',
          updatedAt: '2025-07-12T02:26:16.000Z'
        }
      ],
      offset: +offset || 0,
      limit: +limit || 20,
      total: 45,
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
