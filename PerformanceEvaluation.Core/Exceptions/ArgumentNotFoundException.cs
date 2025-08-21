namespace PerformanceEvaluation.Core.Exceptions
{
    public class ArgumentNotFoundException : Exception
    {
        public ArgumentNotFoundException(string message) : base(message) { }
        public ArgumentNotFoundException(string message, Exception innerException) : base(message, innerException) { }
    }
}