static void Main(string[] args)
{
    int[,] a = new int[10,10];
    int res = 0;

    for (int i = 0; i < 10; i++)
    {
        for (int j = 0; j < 10; j++)
        {
                a[j,i]++;
        }
    }

}