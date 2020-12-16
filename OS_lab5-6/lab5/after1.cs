using System;
using System.Diagnostics;

public class Program
{
  public static void Main(string[] args)
  {
    Stopwatch stopWatch = new Stopwatch();
    stopWatch.Start();
    
    byte[, ] a = new byte[2000, 2000];
    for (int i = 0; i < 2000; i++)
    {
      for (int j = 0; j < 2000; j++)
      {
        ++a[i, j];
        
      }
    }
    stopWatch.Stop();
    Console.WriteLine(stopWatch.ElapsedTicks);
  }
}