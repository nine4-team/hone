export const SKILL_PACK_VERSION = 3;

export type SkillPackImportMode = 'active' | 'arsenal';

export type SkillPackSkill = {
  key: string;
  name: string;
  notes: string[];
  media: Array<{
    url: string;
    title: string;
    thumbnailUrl: string;
    notes: string;
  }>;
};

export type SkillPack = {
  slug: string;
  title: string;
  description: string;
  level: string;
  skills: SkillPackSkill[];
};

function videoNote(title: string, lines: string[]) {
  return lines.join('\n');
}

const sideControlVideoNote = videoNote('3 MUST-KNOW Side Control Escapes (Lachlan Giles)', [
  'Context: Lachlan presents three major side-control escape paths and explains when each becomes appropriate based on distance, frames, and the opponent\'s base.',
  '- Main branches: frame to guard recovery, underhook to wrestle up, or sit-up escape to outside control.',
  '- Build distance with forearm frames, stiff-arm frames, shin/knee frames, and by turning onto your side.',
  '- Forearm frames redirect head/shoulder pressure; shin frames stretch the hips away and create space for the top leg.',
  '- If frames stall, swim for your own underhook, use pillow defense to beat the crossface, hip away, and reach for a leg.',
  '- If they switch their base to stop your knee coming through, block the bottom hip, clear the crossface, stiff-arm, and build up.',
]);

const mountVideoNote = videoNote('How I Escape EVERYONES Mount', [
  'Context: this video teaches a kipping mount escape sequence. The main point is that the kip only works after you win inside position and displace their base.',
  '- Run the escape in order: inside position first, base displacement second, kip last.',
  '- Inside position has three parts: inside elbows, inside feet or knees, and inside forehead.',
  '- Control the hips with hands or frames, move your forehead inside, separate their feet, and avoid reaching your arms out where they can isolate you.',
  '- Before kipping, bridge to displace their base so their hips are no longer parallel to the mat and their weight is loaded over one knee.',
  '- Keep knees and feet together during the kip. The kip is extra disruption after their mount is already displaced, not the main force.',
]);

const masonBackEscapeVideoNote = videoNote('The ONLY Back Escape You Need (It\'s Simple)', [
  'Context: this video studies Mason Fowler\'s back escape, especially escaping toward the choking-arm side in no-gi rather than defaulting to the control side.',
  '- Get to the choking side, then misalign your hips so your hips face a different direction than the attacker\'s hips.',
  '- Keep attention on the seatbelt instead of getting distracted by the hooks first.',
  '- Use a hook grip under the fingers to break the seatbelt, separate the hands, then quickly go two-on-one and remove the arm over your head.',
  '- After the shoulders reach the mat and you turn to face, use inside elbow/leg control or the crossed-feet follow-up to avoid simply giving up mount.',
]);

const kentaBodyTriangleVideoNote = videoNote(
  'Kenta Iwamoto: How to Escape the Body Triangle in BJJ (Simple Hip Shift & Side Switch Trick!)',
  [
    'Context: this short body-triangle clip focuses on shifting the pelvis inside the lock, then changing sides without letting the top player mount.',
    '- Shift your pelvis/hips inside the body triangle to make the lock harder to keep.',
    '- When switching sides, overwrap and hold the opponent\'s leg instead of just rolling across.',
    '- Put weight through their leg and pin the knee to the floor so they cannot easily extract it and mount.',
    '- Keep your head away, frame if they try to come up, and look to turn once the knee is controlled.',
  ],
);

const gordonBodyTriangleVideoNote = videoNote('The Best Way To Escape From The Jiu Jitsu Body Triangle by Gordon Ryan', [
  'Context: Gordon frames body-triangle escapes around upper-body side and leg-lock configuration, then demonstrates an overhook-side, top-side triangle escape.',
  '- Keep the primary defensive hand in place with inside thumb position so the choking hand stays controlled.',
  '- Use the secondary hand as a hand assist instead of relying on foot-lock counters.',
  '- Put the secondary elbow under the opponent\'s knee, rotate/turn down to expose the ankle, then scissor your legs to trap that leg.',
  '- Once the triangle starts to unravel, control the foot, square your hips up if they try to relock, clear the bottom hook, and then deal with the upper body.',
]);

const jozefTurtleVideoNote = videoNote(
  'JOZEF CHEN revolutionizing turtle "Stop Giving Up Your Back! Turtle Escape & Back-Exposure System',
  [
    'Context: Jozef shows an open-turtle approach that uses one knee to chest and one knee away to make the hook threat more predictable, then turns that read into a hip-switch reversal.',
    '- Play one knee to chest and one knee away so the hook threat is forced to one side.',
    '- Monitor the cradle hand and protect your chin before switching your hips.',
    '- Hip-switch when their weight commits to your hips, clear their knee off your hip, then knock them down.',
    '- Control the high leg to stay on top; if it retracts, expect to transition into front headlock or a scramble.',
    '- If you cannot get behind them, shoot deep to a seatbelt, emphasize shoulder position, and shoulder-roll to expose the back.',
  ],
);

const kentaHookCounterVideoNote = videoNote('ESCAPE the Back EVERY Time - High-Crotch Counter to Hooks (BJJ Back Defense)', [
  'Context: this is the specific Kenta Iwamoto hook-entry counter. It fits inside the broader turtle system when they are behind you and start inserting a hook to take the back.',
  '- Protect one side and anticipate the hook before it settles.',
  '- Build an underhook/high-crotch grip as the hook comes in.',
  '- Option 1: pull up, post your hand, pin their hip to the floor, then shelf the leg or roll through to secure position.',
  '- Option 2: if their weight blocks the hip pin, lift, put your hips underneath their legs, and sneak out from the back side.',
]);

const rauBackEscapesVideoNote = videoNote('3 back escapes I tested over years of trial and error', [
  'Context: Rau covers three common back-escape scenarios, including high-ball ride, turtle with no hooks, and back-triangle threats.',
  '- Against the high-ball ride, defend the neck and second hook at the same time: chin to shoulder, eyes toward the armpit, monitor the knee, and toe-knee walk to free the hip.',
  '- If you reach turtle with no hooks, roll over the same-side shoulder while overwrapping the leg and keeping knees to chest, then monitor the hook and come on top or recover guard.',
  '- Against the back-triangle entry, slide down, get your shoulder below the knee, keep weight on the locking leg, turn thumb down/elbow up, and swim through to escape.',
  '- The shared theme is hip/shoulder misalignment plus hook denial, not forcing a single reversal from every back-exposure position.',
]);

const snapdownVideoNote = videoNote('Snap down for BJJ (Lachlan Giles)', [
  'Context: Lachlan teaches the snapdown as a way to break posture and create go-behind/back-attack opportunities, especially by forcing posture instead of just yanking on the head.',
  '- Start from head/shoulder contact and use hand fighting, head position, and leg threat reactions to make the opponent bring their posture forward.',
  '- Useful snapdown grips include one hand behind the head and the other on the shoulder/triceps area, but inside hand position matters so they cannot hang off your head or shoulders.',
  '- Do not go straight to the snap every time. Push, threaten the legs, or make them push back so the snap has a reaction to work with.',
  '- The movement comes heavily from the legs: step/retract the lead leg and drop weight so the hands guide the head rather than doing all the work.',
  '- After the snap, keep a chin strap, put your shoulder in front of their shoulder, shake them down if needed, block the near arm, step the knee outside, and spin to a seatbelt/back position.',
]);

const goBehindVideoNote = videoNote('#1 Takedown In Wrestling With David Taylor', [
  'Context: David Taylor presents the go-behind as the highest-percentage wrestling score from front headlock/front head trap situations.',
  '- Treat front headlock as a scoring position, not a stalemate.',
  '- First priority: put their head to their hand to create the angle.',
  '- Second priority: block or drag the arm so they cannot square back up while you circle.',
  '- Keep your chest high on their back; if your chest comes off, they can circle and force a neutral/no-score position.',
  '- Be decisive about which side you go behind on, then circle to the corner, finish to the hip, and keep moving through the score.',
]);

const turtleTopBackTakeVideoNote = videoNote('The best way to take the back from turtle #bjj #jiujitsu', [
  'Context: this short teaches the two-on-one leg method for taking the back from top turtle.',
  '- Drive in and secure a two-on-one grip on the leg.',
  '- Push their knee down to the mat so it becomes easy to insert the first hook.',
  '- If they put the shoulder to the ground and their hips leave the space between your knees, accelerate with your knee so you roll through.',
  '- Treat this as a simple recurring sequence to drill: two-on-one leg control, knee down, first hook, roll-through follow if their shoulder drops.',
]);

const straightjacketStrangleVideoNote = videoNote('Back Attack Secrets with Gordon Ryan', [
  'Context: Gordon shows a straightjacket-style hand-trapping path from back control, especially from the underhook side where hand trapping is easier but feeding the strangle is harder.',
  '- On the underhook side, go ear-to-ear to close the space their head and shoulders would escape into.',
  '- Strip the primary defensive hand, then switch to cross-wrist control when the secondary hand comes up to pull your choking hand down.',
  '- Split the hands and glue them to the opponent\'s torso so the one-on-one grips are reinforced by their body instead of floating in space.',
  '- Use the leg to trap the wrist, cross the ankles, then return to one-on-one control to create a one-attacking-hand-versus-zero-defensive-hands scenario.',
  '- To feed the strangle from the underhook side, do not pull your elbow backward and lose ear-to-ear control. Bring your shoulder line toward your elbow, then use gravity to feed the hand behind the head.',
]);

const rearNakedStrangleFinishVideoNote = videoNote('The One Submission Every Grappler Must Know - Gordon Ryan', [
  'Context: Gordon focuses on finishing mechanics for the rear naked strangle once the choking hand is already in position.',
  '- The main problem is not just squeezing harder; poor hand setting can make you burn out with a locked-looking strangle.',
  '- Concave the shoulders and hollow the body to create space for the support arm to shoot through.',
  '- Get the back of the support hand to the partner\'s head and connect fingertips to bicep before finishing.',
  '- Before squeezing, bring both elbows together to strengthen the fingertip-to-bicep connection.',
  '- The goal is a stable figure-four connection that holds even when the opponent pushes the elbow or starts common escape reactions.',
]);

const sideControlEscape: SkillPackSkill = {
  key: 'chaining-side-control-escapes',
  name: 'Side Control Escape',
  notes: [],
  media: [
    {
      url: 'https://www.youtube.com/watch?v=by85KB6wf8A',
      title: '3 MUST-KNOW Side Control Escapes (Lachlan Giles)',
      thumbnailUrl: 'https://i.ytimg.com/vi/by85KB6wf8A/maxresdefault.jpg',
      notes: sideControlVideoNote,
    },
  ],
};

const mountEscape: SkillPackSkill = {
  key: 'chaining-mount-escapes',
  name: 'Mount Escape',
  notes: [],
  media: [
    {
      url: 'https://www.youtube.com/watch?v=Y9IQTgX_-4M',
      title: 'How I Escape EVERYONES Mount',
      thumbnailUrl: 'https://i.ytimg.com/vi_webp/Y9IQTgX_-4M/maxresdefault.webp',
      notes: mountVideoNote,
    },
  ],
};

const backEscape: SkillPackSkill = {
  key: 'back-escape',
  name: 'Back Escape',
  notes: [],
  media: [
    {
      url: 'https://www.youtube.com/watch?v=AIMpwyvs_I8',
      title: 'The ONLY Back Escape You Need (It\'s Simple)',
      thumbnailUrl: 'https://i.ytimg.com/vi_webp/AIMpwyvs_I8/maxresdefault.webp',
      notes: masonBackEscapeVideoNote,
    },
    {
      url: 'https://www.youtube.com/watch?v=3RvUyWJ726k',
      title: 'Kenta Iwamoto: How to Escape the Body Triangle in BJJ (Simple Hip Shift & Side Switch Trick!)',
      thumbnailUrl: 'https://i.ytimg.com/vi_webp/3RvUyWJ726k/maxresdefault.webp',
      notes: kentaBodyTriangleVideoNote,
    },
    {
      url: 'https://www.youtube.com/watch?v=RscLPT0F-DE',
      title: 'The Best Way To Escape From The Jiu Jitsu Body Triangle by Gordon Ryan',
      thumbnailUrl: 'https://i.ytimg.com/vi_webp/RscLPT0F-DE/maxresdefault.webp',
      notes: gordonBodyTriangleVideoNote,
    },
  ],
};

const turtleReversal: SkillPackSkill = {
  key: 'knee-to-chest-turtle-reversals',
  name: 'Turtle Reversal',
  notes: [],
  media: [
    {
      url: 'https://www.youtube.com/watch?v=Ft6OyIZ6vPs',
      title: 'JOZEF CHEN revolutionizing turtle "Stop Giving Up Your Back! Turtle Escape & Back-Exposure System',
      thumbnailUrl: 'https://i.ytimg.com/vi_webp/Ft6OyIZ6vPs/maxresdefault.webp',
      notes: jozefTurtleVideoNote,
    },
    {
      url: 'https://www.youtube.com/watch?v=1OizJugW9HI',
      title: 'ESCAPE the Back EVERY Time - High-Crotch Counter to Hooks (BJJ Back Defense)',
      thumbnailUrl: 'https://i.ytimg.com/vi_webp/1OizJugW9HI/maxresdefault.webp',
      notes: kentaHookCounterVideoNote,
    },
    {
      url: 'https://www.youtube.com/watch?v=NC61-GXaIAM',
      title: '3 back escapes I tested over years of trial and error',
      thumbnailUrl: 'https://i.ytimg.com/vi_webp/NC61-GXaIAM/maxresdefault.webp',
      notes: rauBackEscapesVideoNote,
    },
  ],
};

const snapdown: SkillPackSkill = {
  key: 'snapdown',
  name: 'Snapdown',
  notes: [],
  media: [
    {
      url: 'https://www.youtube.com/watch?v=BjvWqnaC5AI',
      title: 'Snap down for BJJ (Lachlan Giles)',
      thumbnailUrl: 'https://i.ytimg.com/vi/BjvWqnaC5AI/maxresdefault.jpg',
      notes: snapdownVideoNote,
    },
  ],
};

const goBehind: SkillPackSkill = {
  key: 'go-behind',
  name: 'Go-behind',
  notes: [],
  media: [
    {
      url: 'https://www.youtube.com/watch?v=Jnpz53nt4Ec',
      title: '#1 Takedown In Wrestling With David Taylor',
      thumbnailUrl: 'https://i.ytimg.com/vi/Jnpz53nt4Ec/maxresdefault.jpg',
      notes: goBehindVideoNote,
    },
  ],
};

const backTakeFromTurtleTop: SkillPackSkill = {
  key: 'back-take-from-turtle-top',
  name: 'Back Take from Turtle Top',
  notes: [],
  media: [
    {
      url: 'https://www.youtube.com/shorts/XxxgO5o7KU4',
      title: 'The best way to take the back from turtle #bjj #jiujitsu',
      thumbnailUrl: 'https://i.ytimg.com/vi/XxxgO5o7KU4/maxresdefault.jpg',
      notes: turtleTopBackTakeVideoNote,
    },
  ],
};

const rearNakedStrangle: SkillPackSkill = {
  key: 'rear-naked-strangle',
  name: 'Rear Naked Strangle',
  notes: [],
  media: [
    {
      url: 'https://www.youtube.com/watch?v=zcJe8NnWtfk',
      title: 'Back Attack Secrets with Gordon Ryan',
      thumbnailUrl: 'https://i.ytimg.com/vi/zcJe8NnWtfk/maxresdefault.jpg',
      notes: straightjacketStrangleVideoNote,
    },
    {
      url: 'https://www.youtube.com/watch?v=3HD-82xrBJU',
      title: 'The One Submission Every Grappler Must Know - Gordon Ryan',
      thumbnailUrl: 'https://i.ytimg.com/vi/3HD-82xrBJU/maxresdefault.jpg',
      notes: rearNakedStrangleFinishVideoNote,
    },
  ],
};

export const skillPacks: SkillPack[] = [
  {
    slug: 'escape-basics',
    title: 'Positional Escape Basics',
    description: 'Core escapes for the three positions beginners get stuck in most: side control, mount, and the back.',
    level: 'Beginner',
    skills: [sideControlEscape, mountEscape, backEscape],
  },
  {
    slug: 'back-attack-basics',
    title: 'Back Attack Basics',
    description: 'Snapdowns, go-behinds, turtle-top back takes, and rear naked strangle mechanics for building a basic back-attack pathway.',
    level: 'Beginner',
    skills: [snapdown, goBehind, backTakeFromTurtleTop, rearNakedStrangle],
  },
  {
    slug: 'scrambler',
    title: 'Scrambler',
    description: 'Turtle and back-exposure reversals for turning defensive scrambles into top position.',
    level: 'Intermediate',
    skills: [turtleReversal],
  },
];

export const starterSkills = skillPacks.flatMap((pack) => pack.skills);
export const STARTER_SKILL_VERSION = SKILL_PACK_VERSION;
