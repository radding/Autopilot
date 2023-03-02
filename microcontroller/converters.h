#ifndef CONVERTERS_H
#define CONVERTERS_H

template <typename Tvalue>
void shift(char *result, Tvalue &val, int bytes)
{

	for (int ndx = 0; ndx < bytes; ndx++)
	{
		// int shiftSize = (bytes - 1) - ndx;
		result[ndx] = (val >> 8 * ndx) & 0xFF;
	}

	return result;
}

// char *convert(int payload);
// char *convert(unsigned int payload);
// char *convert(bool payload);
// char *convert(short payload);
// char *convert(long payload);
// char *convert(unsigned long payload);
// char *convert(double payload);
#endif