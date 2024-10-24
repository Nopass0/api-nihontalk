interface TestData {
  type: 'single' | 'multiple' | 'pairs' | 'sequence';
  question: string;
  options: string[];
  correctAnswer: string | string[] | [string, string][] | string[];
  allowMultiple?: boolean;
}

interface TestResult {
  score: number;
  correctAnswers: any;
}

export async function validateTestResult(testData: TestData, userAnswers: any): Promise<TestResult> {
  let score = 0;
  let correctAnswers = testData.correctAnswer;

  switch (testData.type) {
    case 'single':
      if (userAnswers === testData.correctAnswer) {
        score = 100;
      }
      break;

    case 'multiple':
      if (Array.isArray(userAnswers) && Array.isArray(testData.correctAnswer)) {
        const correct = testData.correctAnswer.every(answer => userAnswers.includes(answer)) &&
          userAnswers.every(answer => testData.correctAnswer.includes(answer));
        if (correct) {
          score = 100;
        }
      }
      break;

    case 'pairs':
      if (Array.isArray(userAnswers)) {
        const correctPairs = testData.correctAnswer as [string, string][];
        const userPairs = userAnswers as [string, string][];
        
        const correct = correctPairs.every(([first, second]) =>
          userPairs.some(([userFirst, userSecond]) =>
            userFirst === first && userSecond === second
          )
        );

        if (correct) {
          score = 100;
        }
      }
      break;

    case 'sequence':
      if (Array.isArray(userAnswers) && Array.isArray(testData.correctAnswer)) {
        const correct = userAnswers.every(
          (answer, index) => answer === testData.correctAnswer[index]
        );
        if (correct) {
          score = 100;
        }
      }
      break;
  }

  return { score, correctAnswers };
}