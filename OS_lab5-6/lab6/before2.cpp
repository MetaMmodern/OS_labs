#include<stdio.h>
#include <unistd.h>

void new_func1(void);

int resultOfSum(int a, int b)
{
  return a+b;
}

int func2(int a, int b)
{
  int res = 0;
    for(int i = 0; i < 10; i++)
  {
    usleep(1);
    if(i>8)
      res = resultOfSum(a, b);
    if(res > 0)
      return res;
  }
    return res;
}

int func1(int a, int b)
{
  int res = 0;
    for(int i = 0; i < 10; i++)
  {
    int res = func2(a, b);
    if(res > 0)
      return res;
  }

    return 0;
}




int main(void)
{
    func1(5, 10);

    return 0;
}